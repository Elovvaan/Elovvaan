import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { User } from './database/entities/user.entity';
import { Board } from './database/entities/board.entity';
import { Entry } from './database/entities/entry.entity';
import { Payment } from './database/entities/payment.entity';
import { Winner } from './database/entities/winner.entity';
import { Notification } from './database/entities/notification.entity';
import { Referral } from './database/entities/referral.entity';
import { QueueModule } from './common/queues/queue.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { GlobalRateLimitMiddleware } from './common/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    QueueModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Board, Entry, Payment, Winner, Notification, Referral],
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
    ReferralsModule,
    AdminModule
  ],
  providers: [GlobalRateLimitMiddleware]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalRateLimitMiddleware).forRoutes('*');
  }
}
