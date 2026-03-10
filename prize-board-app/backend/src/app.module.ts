import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BoardsModule } from './modules/boards/boards.module';
import { EntriesModule } from './modules/entries/entries.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WinnersModule } from './modules/winners/winners.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { RedisService } from './common/redis.service';
import { User } from './database/entities/user.entity';
import { Board } from './database/entities/board.entity';
import { Entry } from './database/entities/entry.entity';
import { Payment } from './database/entities/payment.entity';
import { Winner } from './database/entities/winner.entity';
import { Notification } from './database/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Board, Entry, Payment, Winner, Notification],
        synchronize: true
      })
    }),
    AuthModule,
    UsersModule,
    BoardsModule,
    EntriesModule,
    PaymentsModule,
    WinnersModule,
    NotificationsModule,
    AdminModule
  ],
  providers: [RedisService]
})
export class AppModule {}
