import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entry } from '../../database/entities/entry.entity';
import { BoardStatus } from '../../database/entities/board.entity';
import { BoardsService } from '../boards/boards.service';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { WinnersService } from '../winners/winners.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Entry) private entriesRepo: Repository<Entry>,
    private boardsService: BoardsService,
    private paymentsService: PaymentsService,
    private usersService: UsersService,
    private winnersService: WinnersService,
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService
  ) {}

  async enterBoard(boardId: string, userId: string, paymentId: string) {
    const board = await this.boardsService.get(boardId);
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('Invalid user');
    }

    if (board.status !== BoardStatus.OPEN) {
      throw new BadRequestException('Board is not open for entries');
    }

    const duplicate = await this.entriesRepo.findOne({ where: { payment: { id: paymentId } } });
    if (duplicate) {
      throw new BadRequestException('Entry already exists for this payment');
    }

    const payment = await this.paymentsService.assertPaymentSucceeded(paymentId, userId, boardId);

    const entry = await this.entriesRepo.save(this.entriesRepo.create({ board, user, payment }));
    const updatedBoard = await this.boardsService.incrementEntryCount(boardId);
    const userAfterEntry = await this.usersService.awardXp(userId, 100);

    this.notificationsGateway.broadcast('entry_added', { boardId, entryId: entry.id });
    this.notificationsGateway.broadcast('board_update', updatedBoard);
    this.notificationsGateway.broadcast('xp_updated', {
      userId,
      xp: userAfterEntry.xp,
      prestigeLevel: userAfterEntry.prestigeLevel
    });

    await this.notificationsService.notify(userId, 'ENTRY_CONFIRMED', `You have entered ${updatedBoard.title}`);

    if (updatedBoard.status === BoardStatus.FULL) {
      const winner = await this.winnersService.selectWinner(updatedBoard.id);
      await this.boardsService.closeBoard(updatedBoard.id);
      await this.usersService.awardXp(winner.userId, 500);
      await this.notificationsService.notify(winner.userId, 'WINNER_SELECTED', `You won ${updatedBoard.title}`);
      this.notificationsGateway.broadcast('board_full', updatedBoard);
      this.notificationsGateway.broadcast('winner_selected', winner);
    }

    return entry;
  }
}
