import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UsersService } from '../users/users.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService, private usersService: UsersService) {}

  @Post('create-intent')
  async createIntent(@Body() body: { userId: string; amount: number }) {
    const user = await this.usersService.findById(body.userId);
    if (!user) throw new Error('User not found');
    return this.paymentsService.createIntent(user, body.amount);
  }

  @Post('webhook')
  async webhook(@Body() body: { paymentIntentId: string }) {
    const payment = await this.paymentsService.markSucceeded(body.paymentIntentId);
    return { ok: !!payment };
  }
}
