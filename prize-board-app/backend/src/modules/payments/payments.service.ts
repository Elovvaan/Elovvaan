import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../../database/entities/payment.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    config: ConfigService,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>
  ) {
    this.stripe = new Stripe(config.get<string>('STRIPE_SECRET_KEY') || '', { apiVersion: '2024-04-10' });
  }

  async createIntent(user: User, amount: number) {
    const intent = await this.stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency: 'usd' });
    const payment = await this.paymentsRepo.save(
      this.paymentsRepo.create({ user, amount, stripePaymentIntent: intent.id, status: PaymentStatus.PENDING })
    );
    return { clientSecret: intent.client_secret, paymentId: payment.id, intentId: intent.id };
  }

  async markSucceeded(intentId: string) {
    const payment = await this.paymentsRepo.findOne({ where: { stripePaymentIntent: intentId }, relations: ['user'] });
    if (!payment) return null;
    payment.status = PaymentStatus.SUCCEEDED;
    return this.paymentsRepo.save(payment);
  }

  findById(id: string) {
    return this.paymentsRepo.findOne({ where: { id }, relations: ['user'] });
  }
}
