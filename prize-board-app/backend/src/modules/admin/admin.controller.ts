import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreatorGuard } from '../../common/guards/creator.guard';
import { PrizeVerificationStatus } from '../../database/entities/board.entity';

@Controller()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('admin/metrics') @UseGuards(JwtAuthGuard, AdminGuard) metrics() { return this.adminService.metrics(); }
  @Get('admin/boards/:id/entries') @UseGuards(JwtAuthGuard, AdminGuard) listEntries(@Param('id') id: string) { return this.adminService.listEntries(id); }
  @Post('admin/boards/:id/verification') @UseGuards(JwtAuthGuard, AdminGuard) verifyBoardPrize(@Param('id') id: string, @Body() body: { verificationStatus: PrizeVerificationStatus }) { return this.adminService.verifyBoardPrize(id, body.verificationStatus); }
  @Patch('admin/boards/:id/close') @UseGuards(JwtAuthGuard, AdminGuard) closeBoard(@Param('id') id: string) { return this.adminService.closeBoard(id); }
  @Get('admin/winners') @UseGuards(JwtAuthGuard, AdminGuard) listWinners() { return this.adminService.listWinners(); }
  @Get('admin/notifications') @UseGuards(JwtAuthGuard, AdminGuard) listNotifications() { return this.adminService.listNotifications(); }

  @Get('creator/boards') @UseGuards(JwtAuthGuard, CreatorGuard) creatorBoards(@Req() req: { user: { sub: string } }) { return this.adminService.creatorBoards(req.user.sub); }
  @Get('creator/boards/:id/stats') @UseGuards(JwtAuthGuard, CreatorGuard) creatorBoardStats(@Req() req: { user: { sub: string } }, @Param('id') id: string) { return this.adminService.creatorBoardStats(req.user.sub, id); }
  @Get('creator/revenue') @UseGuards(JwtAuthGuard, CreatorGuard) creatorRevenue(@Req() req: { user: { sub: string } }) { return this.adminService.creatorRevenue(req.user.sub); }
  @Post('creator/payouts') @UseGuards(JwtAuthGuard, CreatorGuard) requestPayout(@Req() req: { user: { sub: string } }, @Body() body: { amount: number }) { return this.adminService.requestPayout(req.user.sub, body.amount); }

  @Get('admin/fraud') @UseGuards(JwtAuthGuard, AdminGuard) adminFraud() { return this.adminService.fraudEntries(); }
  @Get('admin/payouts') @UseGuards(JwtAuthGuard, AdminGuard) adminPayouts() { return this.adminService.listPayouts(); }
  @Post('admin/payouts/:id/approve') @UseGuards(JwtAuthGuard, AdminGuard) approvePayout(@Param('id') id: string) { return this.adminService.approvePayout(id); }
  @Get('admin/creator-metrics') @UseGuards(JwtAuthGuard, AdminGuard) creatorMetrics() { return this.adminService.creatorMetrics(); }

  @Patch('admin/users/:id/suspend')
  @UseGuards(JwtAuthGuard, AdminGuard)
  suspendUser(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() body: { reason: string }) {
    return this.adminService.suspendUser(req.user.sub, id, body.reason);
  }

  @Get('admin/transactions/lookup')
  @UseGuards(JwtAuthGuard, AdminGuard)
  transactionLookup(@Req() req: { user: { sub: string } }, @Query('q') query: string) {
    return this.adminService.lookupTransaction(req.user.sub, query);
  }

  @Post('admin/users/:id/wallet-adjustments')
  @UseGuards(JwtAuthGuard, AdminGuard)
  walletAdjustment(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() body: { amountDelta: number; reason: string }) {
    return this.adminService.adjustWallet(req.user.sub, id, body.amountDelta, body.reason);
  }

  @Post('admin/users/:id/fraud-notes')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createFraudNote(@Req() req: { user: { sub: string } }, @Param('id') id: string, @Body() body: { note: string }) {
    return this.adminService.addFraudNote(req.user.sub, id, body.note);
  }

  @Get('admin/users/:id/fraud-notes')
  @UseGuards(JwtAuthGuard, AdminGuard)
  listFraudNotes(@Param('id') id: string) {
    return this.adminService.getFraudNotes(id);
  }


  @Post('admin/analytics/aggregate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  aggregateDailyMetrics(@Req() req: { user: { sub: string } }, @Body() body: { day: string }) {
    return this.adminService.enqueueDailyMetricsAggregation(req.user.sub, body.day);
  }
}

