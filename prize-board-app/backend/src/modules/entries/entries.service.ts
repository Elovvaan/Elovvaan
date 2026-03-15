import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Entry, EntryReviewStatus } from '../../database/entities/entry.entity';
import { Board, BoardStatus } from '../../database/entities/board.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Payout, PayoutStatus } from '../../database/entities/payout.entity';
import { BoardsService } from '../boards/boards.service';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { WinnersService } from '../winners/winners.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { QueueService } from '../../common/queues/queue.service';
import { ENTRY_QUEUE, WINNER_QUEUE } from '../../common/queues/queue.constants';
import { RedisService } from '../../common/redis.service';

export interface EntryJobData {
  boardId: string;
  userId: string;
  paymentId: string;
  quantity: number;
}

@Injectable()
export class EntriesService {
  private static readonly MAX_ENTRIES_PER_USER = 5;
  private readonly logger = new Logger(EntriesService.name);

  constructor(
    @InjectRepository(Entry) private entriesRepo: Repository<Entry>,
    private dataSource: DataSource,
    private boardsService: BoardsService,
    private paymentsService: PaymentsService,
    private usersService: UsersService,
    private winnersService: WinnersService,
    private notificationsGateway: NotificationsGateway,
    private notificationsService: NotificationsService,
    @InjectRepository(Payout) private payoutsRepo: Repository<Payout>,
    private queueService: QueueService,
    private redisService: RedisService
  ) {}

  async enterBoard(boardId: string, userId: string, paymentId: string) {
    const payment = await this.paymentsService.assertPaymentSucceeded(paymentId, userId, boardId);
    const board = await this.boardsService.get(boardId);
    if (board.status !== BoardStatus.OPEN) {
      throw new BadRequestException('Board is not open for entries');
    }

    const job = await this.queueService.add<EntryJobData>(
      ENTRY_QUEUE,
      'create-entry',
      { boardId, userId, paymentId, quantity: payment.entryQuantity || 1 },
      { jobId: `entry:${paymentId}` }
    );

    return this.queueService.waitForCompletion<Entry>(job);
  }

  async processEntryJob(data: EntryJobData) {
    const { boardId, userId, paymentId, quantity } = data;
    const boardLockKey = `lock:board-entry:${boardId}`;
    const lockValue = `${paymentId}:${Date.now()}`;
    const locked = await this.redisService.setNx(boardLockKey, lockValue, 10);
    if (!locked) {
      throw new BadRequestException('Board is busy processing entries. Please retry.');
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const boardRepo = manager.getRepository(Board);
        const entryRepo = manager.getRepository(Entry);
        const board = await boardRepo.findOne({ where: { id: boardId }, lock: { mode: 'pessimistic_write' } });
        if (!board || board.status !== BoardStatus.OPEN) {
          throw new BadRequestException('Board is not open for entries');
        }

        const duplicateEntries = await entryRepo.find({ where: { payment: { id: paymentId } }, order: { createdAt: 'ASC' } });
        if (duplicateEntries.length > 0) {
          return duplicateEntries[0];
        }

        const userEntries = await entryRepo.count({ where: { user: { id: userId }, board: { id: boardId } } });
        if (userEntries + quantity > EntriesService.MAX_ENTRIES_PER_USER) {
          throw new ForbiddenException('Entry limit reached');
        }

        if (board.currentEntries + quantity > board.maxEntries) {
          board.status = BoardStatus.FULL;
          await boardRepo.save(board);
          throw new BadRequestException('Board is full');
        }

        const payment = await this.paymentsService.assertPaymentSucceeded(paymentId, userId, boardId);
        const user = await this.usersService.findById(userId);
        if (!user) {
          throw new BadRequestException('Invalid user');
        }

        const paymentRepo = manager.getRepository(Payment);
        let fraudScore = 0;
        if (payment.ipAddress) {
          const sameIpCount = await paymentRepo.count({ where: { ipAddress: payment.ipAddress } });
          if (sameIpCount >= 5) {
            fraudScore += 40;
          }
        }

        if (payment.paymentMethodFingerprint) {
          const sameMethodCount = await paymentRepo.count({ where: { paymentMethodFingerprint: payment.paymentMethodFingerprint } });
          if (sameMethodCount >= 3) {
            fraudScore += 35;
          }
        }

        const rapidAccounts = await manager
          .createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from('users', 'u')
          .where("u.created_at >= NOW() - INTERVAL '15 minutes'")
          .getRawOne<{ count: string }>();
        if (Number(rapidAccounts?.count || 0) >= 10) {
          fraudScore += 25;
        }

        const reviewStatus = fraudScore >= 60 ? EntryReviewStatus.FLAGGED : EntryReviewStatus.CLEAN;

        const entries: Entry[] = [];
        for (let i = 0; i < quantity; i += 1) {
          const entry = entryRepo.create({
            board,
            user,
            payment,
            externalReference: `${paymentId}:${i}`,
            fraudScore,
            reviewStatus
          });
          entries.push(await entryRepo.save(entry));
        }

        board.currentEntries += quantity;
        if (board.currentEntries >= board.maxEntries) {
          board.status = BoardStatus.FULL;
        }
        const updatedBoard = await boardRepo.save(board);
        const userAfterEntry = await this.usersService.awardXp(userId, 100 * quantity);

        this.logger.log(JSON.stringify({ event: 'entry_created', boardId, userId, paymentId, quantity }));
        this.notificationsGateway.broadcast('entry_added', { boardId, entryId: entries[0]?.id, quantity });
        this.notificationsGateway.broadcast('board_progress', { boardId, currentEntries: updatedBoard.currentEntries, maxEntries: updatedBoard.maxEntries });
        this.notificationsGateway.broadcast('board_update', updatedBoard);
        await this.boardsService.recordActivity(boardId, 'entry_added', { userId, quantity, currentEntries: updatedBoard.currentEntries });
        this.notificationsGateway.broadcast('xp_updated', {
          userId,
          xp: userAfterEntry.xp,
          prestigeLevel: userAfterEntry.prestigeLevel
        });
        await this.notificationsService.notify(userId, 'ENTRY_CONFIRMED', `You have entered ${updatedBoard.title}`);

        if (updatedBoard.status === BoardStatus.FULL) {
          this.logger.log(JSON.stringify({ event: 'board_full', boardId: updatedBoard.id }));
          await this.queueService.add(WINNER_QUEUE, 'select-winner', { boardId: updatedBoard.id }, { jobId: `winner:${updatedBoard.id}` });
        } else if (updatedBoard.maxEntries - updatedBoard.currentEntries <= 5) {
          await this.notificationsService.notify(userId, 'BOARD_ALMOST_FULL', `${updatedBoard.title} is almost full.`);
        }

        const fillPct = Number(((updatedBoard.currentEntries / Math.max(updatedBoard.maxEntries, 1)) * 100).toFixed(2));
        await this.redisService.set(`board:fill:${boardId}`, JSON.stringify({
          currentEntries: updatedBoard.currentEntries,
          maxEntries: updatedBoard.maxEntries,
          fillPct,
          status: updatedBoard.status
        }), 600);

        return entries[0];
      });
    } finally {
      const lockOwner = await this.redisService.get(boardLockKey);
      if (lockOwner === lockValue) {
        await this.redisService.del(boardLockKey);
      }
    }
  }

  async processWinnerJob(boardId: string) {
    const winner = await this.winnersService.selectWinner(boardId);
    const closedBoard = await this.boardsService.closeBoard(boardId);
    const winnerAfterAward = await this.usersService.awardXp(winner.userId, 500);

    await this.notificationsService.notify(winner.userId, 'WINNER_ANNOUNCED', `You won ${closedBoard.title}`);
    this.notificationsGateway.broadcast('winner_selected', winner);
    await this.boardsService.recordActivity(boardId, 'winner_selected', { winnerUserId: winner.userId, entryId: winner.entryId });
    this.notificationsGateway.broadcast('board_update', closedBoard);
    this.notificationsGateway.broadcast('xp_updated', {
      userId: winner.userId,
      xp: winnerAfterAward.xp,
      prestigeLevel: winnerAfterAward.prestigeLevel
    });
    if (closedBoard.creatorUserId && !closedBoard.escrowReleased && Number(closedBoard.creatorShare || 0) > 0) {
      await this.payoutsRepo.save(
        this.payoutsRepo.create({ creatorUserId: closedBoard.creatorUserId, amount: closedBoard.creatorShare, status: PayoutStatus.APPROVED })
      );
      await this.boardsService.markEscrowReleased(boardId);
      await this.notificationsService.notify(closedBoard.creatorUserId, 'PAYOUT_APPROVED', `Escrow released for ${closedBoard.title}`);
    }

    this.logger.log(JSON.stringify({ event: 'winner_selected', boardId, winnerUserId: winner.userId }));
  }
}
