import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { BoardStatus } from '../../database/entities/board.entity';
import { Payment, PaymentStatus } from '../../database/entities/payment.entity';
import { Entry } from '../../database/entities/entry.entity';
import { UsersService } from '../users/users.service';
import { BoardsService } from '../boards/boards.service';
import { QueueService } from '../../common/queues/queue.service';
import { ENTRY_QUEUE, PAYMENT_QUEUE } from '../../common/queues/queue.constants';
import { ReferralsService } from '../referrals/referrals.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatorBoard } from '../../database/entities/creator-board.entity';

interface PaymentJobData {
  eventId: string;
  paymentIntentId: string;
  eventType: string;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private stripeWebhookSecret: string;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    config: ConfigService,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(Entry) private entriesRepo: Repository<Entry>,
    @InjectRepository(CreatorBoard) private creatorBoardsRepo: Repository<CreatorBoard>,
    private usersService: UsersService,
    private boardsService: BoardsService,
    private queueService: QueueService,
    private referralsService: ReferralsService,
    private notificationsService: NotificationsService
  ) {
    this.stripe = new Stripe(config.get<string>('STRIPE_SECRET_KEY') || '', { apiVersion: '2024-06-20' });
    this.stripeWebhookSecret = config.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  async createIntent(
    userId: string,
    boardId: string,
    entryQuantity = 1,
    affiliateCode?: string,
    paymentMethodFingerprint?: string,
    ipAddress?: string
  ) {
    const [user, board, creatorBoard] = await Promise.all([
      this.usersService.findById(userId),
      this.boardsService.get(boardId),
      this.creatorBoardsRepo.findOne({ where: { board: { id: boardId } }, relations: ['creatorUser'] })
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (board.status !== BoardStatus.OPEN) {
      throw new BadRequestException('Board is not open for payments');
    }

    const grossAmount = Number(board.pricePerEntry) * entryQuantity;
    const platformFeePercent = Number(creatorBoard?.platformFeePercent || 0);
    const platformRevenue = Number((grossAmount * (platformFeePercent / 100)).toFixed(2));
    const affiliateCommission = affiliateCode && creatorBoard ? Number((grossAmount * 0.05).toFixed(2)) : 0;
    const creatorRevenue = Number((grossAmount - platformRevenue - affiliateCommission).toFixed(2));

    const amount = Math.round(grossAmount * 100);
    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId, boardId, entryQuantity: String(entryQuantity), affiliateCode: affiliateCode || '' }
    });

    const payment = await this.paymentsRepo.save(
      this.paymentsRepo.create({
        user,
        board,
        amount: grossAmount,
        stripePaymentIntentId: intent.id,
        status: PaymentStatus.PENDING,
        entryQuantity,
        platformRevenue,
        creatorRevenue,
        affiliateCommission,
        affiliateCode,
        paymentMethodFingerprint,
        ipAddress
      })
    );

    return { clientSecret: intent.client_secret, paymentId: payment.id, paymentIntentId: intent.id };
  }

  async processWebhook(signature: string | undefined, payload: Buffer) {
    if (!signature) {
      throw new BadRequestException('Missing stripe signature');
    }

    if (!this.stripeWebhookSecret) {
      throw new BadRequestException('Missing STRIPE_WEBHOOK_SECRET configuration');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, this.stripeWebhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    const paymentIntentId = (event.data.object as Stripe.PaymentIntent)?.id;
    if (!paymentIntentId) {
      return { ok: true, ignored: true };
    }

    await this.queueService.add<PaymentJobData>(
      PAYMENT_QUEUE,
      'process-payment-event',
      { eventId: event.id, paymentIntentId, eventType: event.type },
      { jobId: `payment:${event.id}` }
    );

    return { ok: true, queued: true };
  }

  async processPaymentJob(data: PaymentJobData) {
    const { eventType, paymentIntentId, eventId } = data;

    if (eventType === 'payment_intent.succeeded') {
      const payment = await this.updateStatusByIntentId(paymentIntentId, PaymentStatus.SUCCEEDED, eventId);
      this.logger.log(JSON.stringify({ event: 'payment_confirmed', paymentId: payment.id, paymentIntentId }));

      await this.queueService.add(
        ENTRY_QUEUE,
        'create-entry',
        { boardId: payment.boardId, userId: payment.userId, paymentId: payment.id, quantity: payment.entryQuantity || 1 },
        { jobId: `entry:${payment.id}` }
      );

      const existingEntries = await this.entriesRepo.count({ where: { user: { id: payment.userId } } });
      if (existingEntries === 0) {
        const referral = await this.referralsService.findByReferredUser(payment.userId);
        if (referral) {
          await this.usersService.awardXp(referral.referrerUserId, 500);
          await this.notificationsService.notify(referral.referrerUserId, 'REFERRAL_BONUS', 'Referral bonus +500 XP awarded!');
          this.logger.log(JSON.stringify({ event: 'referral_reward', referrerUserId: referral.referrerUserId, referredUserId: payment.userId }));
        }
      }
    }

    if (eventType === 'payment_intent.payment_failed') {
      await this.updateStatusByIntentId(paymentIntentId, PaymentStatus.FAILED, eventId);
    }
  }

  async updateStatusByIntentId(intentId: string, status: PaymentStatus, webhookEventId?: string) {
    const payment = await this.paymentsRepo.findOne({ where: { stripePaymentIntentId: intentId }, relations: ['user', 'board'] });
    if (!payment) {
      throw new NotFoundException('Payment not found for payment intent');
    }

    if (webhookEventId && payment.webhookEventId === webhookEventId) {
      return payment;
    }

    payment.status = status;
    payment.webhookEventId = webhookEventId;
    return this.paymentsRepo.save(payment);
  }

  async assertPaymentSucceeded(paymentId: string, userId: string, boardId: string) {
    const payment = await this.paymentsRepo.findOne({ where: { id: paymentId }, relations: ['user', 'board'] });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.userId !== userId || payment.boardId !== boardId) {
      throw new BadRequestException('Payment does not match user/board');
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Payment is not successful');
    }

    return payment;
  }

  findById(id: string) {
    return this.paymentsRepo.findOne({ where: { id }, relations: ['user', 'board'] });
  }
}
