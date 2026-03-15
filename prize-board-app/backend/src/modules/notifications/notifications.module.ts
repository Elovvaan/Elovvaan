import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService, NotificationProviders } from './notifications.service';
import { Notification } from '../../database/entities/notification.entity';
import { UserDeviceToken } from '../../database/entities/user-device-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserDeviceToken])],
  providers: [NotificationsGateway, NotificationsService, ...NotificationProviders],
  exports: [NotificationsGateway, NotificationsService]
})
export class NotificationsModule {}
