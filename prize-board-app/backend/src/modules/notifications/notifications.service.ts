import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    private notificationsGateway: NotificationsGateway
  ) {}

  async notify(userId: string, type: string, message: string) {
    const notification = await this.notificationsRepo.save(this.notificationsRepo.create({ userId, type, message }));
    this.notificationsGateway.broadcast('push_notification', { userId, type, message, createdAt: notification.createdAt });
    return notification;
  }
}
