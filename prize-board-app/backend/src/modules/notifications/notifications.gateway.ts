import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RedisService } from '../../common/redis.service';

export type NotificationEvent =
  | 'board_update'
  | 'entry_added'
  | 'board_progress'
  | 'board_fill_update'
  | 'board_full'
  | 'winner_selected'
  | 'push_notification'
  | 'xp_updated';

@WebSocketGateway({ cors: true })
export class NotificationsGateway implements OnModuleInit {
  @WebSocketServer()
  server!: Server;

  constructor(private redis: RedisService) {}

  async onModuleInit() {
    const sub = this.redis.getClient().duplicate();
    await sub.subscribe('ws:broadcast');
    sub.on('message', (_channel, payload) => {
      const message = JSON.parse(payload) as { event: NotificationEvent; payload: unknown };
      this.server.emit(message.event, message.payload);
    });
  }

  async broadcast(event: NotificationEvent, payload: unknown) {
    await this.redis.getClient().publish('ws:broadcast', JSON.stringify({ event, payload }));
    this.server.emit(event, payload);
  }
}
