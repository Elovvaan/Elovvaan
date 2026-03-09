import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

export type NotificationEvent =
  | 'board_update'
  | 'entry_added'
  | 'board_full'
  | 'winner_selected'
  | 'push_notification'
  | 'xp_updated';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  broadcast(event: NotificationEvent, payload: unknown) {
    this.server.emit(event, payload);
  }
}
