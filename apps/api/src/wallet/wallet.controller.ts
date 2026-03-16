import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdjustWalletDto } from './dto/adjust-wallet.dto';
import { TransactionType } from '@prisma/client';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: { id: string }) {
    return this.walletService.getWallet(user.id);
  }

  @Get('transactions')
  transactions(@CurrentUser() user: { id: string }) {
    return this.walletService.transactions(user.id);
  }

  @Post('deposit')
  deposit(@CurrentUser() user: { id: string }, @Body() dto: AdjustWalletDto) {
    return this.walletService.adjust(user.id, dto.amount, TransactionType.DEPOSIT, dto.note ?? 'Deposit placeholder');
  }

  @Post('withdraw')
  withdraw(@CurrentUser() user: { id: string }, @Body() dto: AdjustWalletDto) {
    return this.walletService.adjust(user.id, -Math.abs(dto.amount), TransactionType.WITHDRAWAL, dto.note ?? 'Withdraw placeholder');
  }
}
