import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  broadcast(event: 'board_update' | 'entry_added' | 'board_full' | 'winner_selected', payload: unknown) {
    this.server.emit(event, payload);
  }
}
