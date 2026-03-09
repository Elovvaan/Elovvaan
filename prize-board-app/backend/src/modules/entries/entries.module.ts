import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entry } from '../../database/entities/entry.entity';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { BoardsModule } from '../boards/boards.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';
import { WinnersModule } from '../winners/winners.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Entry]), BoardsModule, PaymentsModule, UsersModule, WinnersModule, NotificationsModule],
  controllers: [EntriesController],
  providers: [EntriesService]
})
export class EntriesModule {}
