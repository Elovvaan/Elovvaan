import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../../database/entities/board.entity';
import { Entry } from '../../database/entities/entry.entity';
import { Notification } from '../../database/entities/notification.entity';
import { Payment } from '../../database/entities/payment.entity';
import { User } from '../../database/entities/user.entity';
import { Winner } from '../../database/entities/winner.entity';
import { CreatorBoard } from '../../database/entities/creator-board.entity';
import { Payout } from '../../database/entities/payout.entity';
import { BoardsModule } from '../boards/boards.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Board, Entry, Payment, Winner, Notification, CreatorBoard, Payout]), BoardsModule, NotificationsModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
