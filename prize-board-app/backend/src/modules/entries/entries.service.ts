import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entry } from '../../database/entities/entry.entity';
import { BoardStatus } from '../../database/entities/board.entity';
import { BoardsService } from '../boards/boards.service';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { WinnersService } from '../winners/winners.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Entry) private entriesRepo: Repository<Entry>,
    private boardsService: BoardsService,
    private paymentsService: PaymentsService,
    private usersService: UsersService,
    private winnersService: WinnersService,
    private notificationsGateway: NotificationsGateway
  ) {}

  async enterBoard(boardId: string, userId: string, paymentId: string) {
    const [board, user, payment] = await Promise.all([
      this.boardsService.get(boardId),
      this.usersService.findById(userId),
      this.paymentsService.findById(paymentId)
    ]);

    if (!user || !payment) throw new Error('Invalid user or payment');
    const entry = await this.entriesRepo.save(this.entriesRepo.create({ board, user, payment }));
    const updatedBoard = await this.boardsService.incrementSpots(boardId);
    this.notificationsGateway.broadcast('entry_added', { boardId, entryId: entry.id });
    this.notificationsGateway.broadcast('board_update', updatedBoard);

    if (updatedBoard.status === BoardStatus.FULL) {
      const entries = await this.entriesRepo.find({ where: { board: { id: boardId } }, relations: ['user'] });
      const winner = await this.winnersService.selectWinner(updatedBoard, entries);
      this.notificationsGateway.broadcast('board_full', updatedBoard);
      this.notificationsGateway.broadcast('winner_selected', winner);
    }

    return entry;
  }
}
