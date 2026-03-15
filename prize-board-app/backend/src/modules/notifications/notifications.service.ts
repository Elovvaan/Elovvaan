import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { UserDeviceToken } from '../../database/entities/user-device-token.entity';
import { QueueService } from '../../common/queues/queue.service';
import { NOTIFICATION_QUEUE } from '../../common/queues/queue.constants';

interface NotificationJobData {
  userId: string;
  type: string;
  message: string;
}

interface OutboundNotificationProvider {
  send(userId: string, payload: { type: string; message: string }): Promise<void>;
}

@Injectable()
class PushNotificationProvider implements OutboundNotificationProvider {
  private readonly logger = new Logger(PushNotificationProvider.name);

  async send(userId: string, payload: { type: string; message: string }): Promise<void> {
    this.logger.log(JSON.stringify({ event: 'push_notification_dispatch', userId, type: payload.type }));
  }
}

@Injectable()
class EmailNotificationProvider implements OutboundNotificationProvider {
  private readonly logger = new Logger(EmailNotificationProvider.name);

  async send(userId: string, payload: { type: string; message: string }): Promise<void> {
    this.logger.log(JSON.stringify({ event: 'email_notification_dispatch', userId, type: payload.type }));
  }
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    @InjectRepository(UserDeviceToken) private userDeviceTokensRepo: Repository<UserDeviceToken>,
    private notificationsGateway: NotificationsGateway,
    private queueService: QueueService,
    private pushProvider: PushNotificationProvider,
    private emailProvider: EmailNotificationProvider
  ) {}

  async registerDeviceToken(userId: string, token: string) {
    const existing = await this.userDeviceTokensRepo.findOne({ where: { token } });
    if (existing) return existing;
    return this.userDeviceTokensRepo.save(this.userDeviceTokensRepo.create({ userId, token, provider: 'fcm' }));
  }

  async notify(userId: string, type: string, message: string) {
    const job = await this.queueService.add<NotificationJobData>(
      NOTIFICATION_QUEUE,
      'dispatch-notification',
      { userId, type, message },
      { jobId: `notification:${type}:${userId}:${Date.now()}` }
    );
    return this.queueService.waitForCompletion<Notification>(job);
  }

  async listForUser(userId: string) {
    return this.notificationsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50
    });
  }

  async processNotificationJob(data: NotificationJobData) {
    const notification = await this.notificationsRepo.save(this.notificationsRepo.create(data));
    this.notificationsGateway.broadcast('push_notification', {
      userId: data.userId,
      type: data.type,
      message: data.message,
      createdAt: notification.createdAt
    });

    await Promise.all([
      this.sendFcm(data.userId, { type: data.type, message: data.message }),
      this.pushProvider.send(data.userId, { type: data.type, message: data.message }),
      this.emailProvider.send(data.userId, { type: data.type, message: data.message })
    ]);

    this.logger.log(JSON.stringify({ event: 'notification_sent', userId: data.userId, type: data.type }));
    return notification;
  }

  private async sendFcm(userId: string, payload: { type: string; message: string }) {
    const tokens = await this.userDeviceTokensRepo.find({ where: { userId } });
    if (!tokens.length) return;
    this.logger.log(JSON.stringify({ event: 'fcm_notification', userId, type: payload.type, tokens: tokens.length }));
  }
}

export const NotificationProviders = [PushNotificationProvider, EmailNotificationProvider];
