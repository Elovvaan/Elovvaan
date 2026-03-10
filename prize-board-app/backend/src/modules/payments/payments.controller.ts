import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  createIntent(@Req() req: { user: { sub: string } }, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createIntent(req.user.sub, dto.boardId);
  }

  @Post('webhook')
  webhook(@Body() body: { type: string; data?: { object?: { id?: string } } }) {
    return this.paymentsService.processWebhook(body.type, body.data?.object?.id || '');
  }
}
