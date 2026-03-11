import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreatorGuard } from '../../common/guards/creator.guard';

@Controller()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('admin/metrics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  metrics() {
    return this.adminService.metrics();
  }

  @Get('admin/boards/:id/entries')
  @UseGuards(JwtAuthGuard, AdminGuard)
  listEntries(@Param('id') id: string) {
    return this.adminService.listEntries(id);
  }

  @Patch('admin/boards/:id/close')
  @UseGuards(JwtAuthGuard, AdminGuard)
  closeBoard(@Param('id') id: string) {
    return this.adminService.closeBoard(id);
  }

  @Get('admin/winners')
  @UseGuards(JwtAuthGuard, AdminGuard)
  listWinners() {
    return this.adminService.listWinners();
  }

  @Get('admin/notifications')
  @UseGuards(JwtAuthGuard, AdminGuard)
  listNotifications() {
    return this.adminService.listNotifications();
  }

  @Get('creator/boards')
  @UseGuards(JwtAuthGuard, CreatorGuard)
  creatorBoards(@Req() req: { user: { sub: string } }) {
    return this.adminService.creatorBoards(req.user.sub);
  }

  @Get('creator/boards/:id/stats')
  @UseGuards(JwtAuthGuard, CreatorGuard)
  creatorBoardStats(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.adminService.creatorBoardStats(req.user.sub, id);
  }

  @Get('creator/revenue')
  @UseGuards(JwtAuthGuard, CreatorGuard)
  creatorRevenue(@Req() req: { user: { sub: string } }) {
    return this.adminService.creatorRevenue(req.user.sub);
  }

  @Post('creator/payouts')
  @UseGuards(JwtAuthGuard, CreatorGuard)
  requestPayout(@Req() req: { user: { sub: string } }, @Body() body: { amount: number }) {
    return this.adminService.requestPayout(req.user.sub, body.amount);
  }

  @Get('admin/fraud')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminFraud() {
    return this.adminService.fraudEntries();
  }

  @Get('admin/payouts')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminPayouts() {
    return this.adminService.listPayouts();
  }

  @Post('admin/payouts/:id/approve')
  @UseGuards(JwtAuthGuard, AdminGuard)
  approvePayout(@Param('id') id: string) {
    return this.adminService.approvePayout(id);
  }

  @Get('admin/creator-metrics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  creatorMetrics() {
    return this.adminService.creatorMetrics();
  }
}
