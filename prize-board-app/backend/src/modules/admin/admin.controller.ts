import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('metrics')
  metrics() {
    return this.adminService.metrics();
  }

  @Get('boards/:id/entries')
  listEntries(@Param('id') id: string) {
    return this.adminService.listEntries(id);
  }

  @Patch('boards/:id/close')
  closeBoard(@Param('id') id: string) {
    return this.adminService.closeBoard(id);
  }

  @Get('winners')
  listWinners() {
    return this.adminService.listWinners();
  }

  @Get('notifications')
  listNotifications() {
    return this.adminService.listNotifications();
  }
}
