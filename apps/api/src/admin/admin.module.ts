import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({ providers: [AdminService, RolesGuard], controllers: [AdminController] })
export class AdminModule {}
