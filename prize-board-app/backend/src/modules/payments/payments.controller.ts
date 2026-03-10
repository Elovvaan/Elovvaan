import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  createIntent(@Req() req: { user: { sub: string } }, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createIntent(req.user.sub, dto.boardId, dto.entryQuantity || 1);
  }

  @Post('webhook')
  webhook(@Headers('stripe-signature') signature: string | undefined, @Req() req: Request) {
    const payload = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    return this.paymentsService.processWebhook(signature, payload);
  }
}
