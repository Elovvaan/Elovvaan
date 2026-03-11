import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { UserDeviceToken } from '../../database/entities/user-device-token.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    @InjectRepository(UserDeviceToken) private userDeviceTokensRepo: Repository<UserDeviceToken>,
    private notificationsGateway: NotificationsGateway
  ) {}

  async registerDeviceToken(userId: string, token: string) {
    const existing = await this.userDeviceTokensRepo.findOne({ where: { token } });
    if (existing) return existing;
    return this.userDeviceTokensRepo.save(this.userDeviceTokensRepo.create({ userId, token, provider: 'fcm' }));
  }

  async notify(userId: string, type: string, message: string) {
    const notification = await this.notificationsRepo.save(this.notificationsRepo.create({ userId, type, message }));
    this.notificationsGateway.broadcast('push_notification', { userId, type, message, createdAt: notification.createdAt });
    await this.sendFcm(userId, { type, message });
    this.logger.log(JSON.stringify({ event: 'notification_sent', userId, type }));
    return notification;
  }

  private async sendFcm(userId: string, payload: { type: string; message: string }) {
    const tokens = await this.userDeviceTokensRepo.find({ where: { userId } });
    if (!tokens.length) return;
    this.logger.log(JSON.stringify({ event: 'fcm_notification', userId, type: payload.type, tokens: tokens.length }));
  }
}
