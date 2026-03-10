import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../../database/entities/payment.entity';
import { UsersService } from '../users/users.service';
import { BoardsService } from '../boards/boards.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    config: ConfigService,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    private usersService: UsersService,
    private boardsService: BoardsService
  ) {
    this.stripe = new Stripe(config.get<string>('STRIPE_SECRET_KEY') || '', { apiVersion: '2024-06-20' });
  }

  async createIntent(userId: string, boardId: string) {
    const [user, board] = await Promise.all([this.usersService.findById(userId), this.boardsService.get(boardId)]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(board.pricePerEntry) * 100),
      currency: 'usd',
      metadata: { userId, boardId }
    });

    const payment = await this.paymentsRepo.save(
      this.paymentsRepo.create({
        user,
        board,
        amount: board.pricePerEntry,
        stripePaymentIntentId: intent.id,
        status: PaymentStatus.PENDING
      })
    );

    return { clientSecret: intent.client_secret, paymentId: payment.id, paymentIntentId: intent.id };
  }

  async processWebhook(eventType: string, paymentIntentId: string) {
    if (!paymentIntentId) {
      throw new BadRequestException('Missing paymentIntentId');
    }

    if (eventType === 'payment_intent.succeeded') {
      await this.updateStatusByIntentId(paymentIntentId, PaymentStatus.SUCCEEDED);
      return { ok: true };
    }

    if (eventType === 'payment_intent.payment_failed') {
      await this.updateStatusByIntentId(paymentIntentId, PaymentStatus.FAILED);
      return { ok: true };
    }

    return { ok: true, ignored: true };
  }

  async updateStatusByIntentId(intentId: string, status: PaymentStatus) {
    const payment = await this.paymentsRepo.findOne({ where: { stripePaymentIntentId: intentId }, relations: ['user', 'board'] });
    if (!payment) {
      throw new NotFoundException('Payment not found for payment intent');
    }

    payment.status = status;
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
