import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WalletService } from '../wallet/wallet.service';

@Controller()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private walletService: WalletService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { sub: string } }) {
    return this.usersService.findById(req.user.sub);
  }

  @Get('leaderboard')
  leaderboard(@Query('limit') limit?: string) {
    return this.usersService.leaderboard(limit ? Number(limit) : 50);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  notifications(@Req() req: { user: { sub: string } }) {
    return this.notificationsService.listForUser(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet/ledger')
  async walletLedger(@Req() req: { user: { sub: string } }) {
    const [balanceCents, transactions] = await Promise.all([
      this.walletService.getBalance(req.user.sub),
      this.walletService.listTransactions(req.user.sub)
    ]);
    return {
      balanceCents,
      transactions
    };
  }
}

