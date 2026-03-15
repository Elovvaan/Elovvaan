import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { Winner, WinnerClaimStatus } from '../../database/entities/winner.entity';
import { Entry } from '../../database/entities/entry.entity';
import { Board } from '../../database/entities/board.entity';
import { AuditService } from '../../common/audit/audit.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class WinnersService {
  private readonly logger = new Logger(WinnersService.name);

  constructor(
    @InjectRepository(Winner) private winnersRepo: Repository<Winner>,
    @InjectRepository(Entry) private entriesRepo: Repository<Entry>,
    @InjectRepository(Board) private boardsRepo: Repository<Board>,
    private dataSource: DataSource,
    private auditService: AuditService,
    private walletService: WalletService
  ) {}

  async selectWinner(boardId: string) {
    const existing = await this.findByBoard(boardId);
    if (existing) {
      return existing;
    }

    const winner = await this.dataSource.transaction(async (manager) => {
      const winnersRepo = manager.getRepository(Winner);
      const boardsRepo = manager.getRepository(Board);
      const entriesRepo = manager.getRepository(Entry);

      const currentWinner = await winnersRepo.findOne({ where: { board: { id: boardId } }, relations: ['user', 'board', 'entry'] });
      if (currentWinner) {
        return currentWinner;
      }

      const board = await boardsRepo.findOne({ where: { id: boardId }, lock: { mode: 'pessimistic_write' } });
      if (!board) {
        throw new NotFoundException('Board not found');
      }

      const entries = await entriesRepo.find({
        where: { board: { id: boardId } },
        relations: ['user'],
        order: { createdAt: 'ASC', id: 'ASC' }
      });

      if (entries.length === 0) {
        throw new BadRequestException('Cannot select winner without entries');
      }

      const closingTimestamp = entries.at(-1)?.createdAt.toISOString() ?? board.createdAt.toISOString();
      const seed = createHash('sha256').update(`${boardId}:${closingTimestamp}`).digest('hex');
      const winnerIndex = Number.parseInt(seed.slice(0, 12), 16) % entries.length;
      const selected = entries[winnerIndex];

      return winnersRepo.save(
        winnersRepo.create({
          board,
          user: selected.user,
          entry: selected,
          selectionSeed: seed,
          selectionCandidateCount: entries.length,
          selectionIndex: winnerIndex,
          claimStatus: WinnerClaimStatus.PENDING
        })
      );
    });

    await this.auditService.log({
      actorUserId: winner.userId,
      action: 'winner.selected',
      targetType: 'board',
      targetId: boardId,
      metadata: {
        winnerId: winner.id,
        entryId: winner.entryId,
        candidateCount: winner.selectionCandidateCount,
        selectionIndex: winner.selectionIndex,
        selectionSeed: winner.selectionSeed
      }
    });

    this.logger.log(JSON.stringify({ event: 'winner_selected', boardId, winnerUserId: winner.userId }));
    return winner;
  }

  async claimWinner(boardId: string, userId: string) {
    const winner = await this.findByBoard(boardId);
    if (!winner) {
      throw new NotFoundException('Winner not found for board');
    }

    if (winner.userId !== userId) {
      throw new ForbiddenException('Only the winner can claim this prize');
    }

    if (winner.claimStatus !== WinnerClaimStatus.PENDING) {
      return winner;
    }

    const claimedWinner = await this.dataSource.transaction(async (manager) => {
      const winnerRepo = manager.getRepository(Winner);
      const boardRepo = manager.getRepository(Board);
      const lockedWinner = await winnerRepo.findOne({ where: { id: winner.id }, relations: ['board'], lock: { mode: 'pessimistic_write' } });
      if (!lockedWinner) {
        throw new NotFoundException('Winner not found');
      }

      if (lockedWinner.claimStatus !== WinnerClaimStatus.PENDING) {
        return lockedWinner;
      }

      lockedWinner.claimStatus = WinnerClaimStatus.CLAIMED;
      lockedWinner.claimedAt = new Date();
      const saved = await winnerRepo.save(lockedWinner);

      const board = await boardRepo.findOne({ where: { id: lockedWinner.boardId } });
      const prizeCents = Math.round(Number(board?.prizeValue || 0) * 100);
      if (prizeCents > 0) {
        await this.walletService.credit(userId, prizeCents, 'WINNER_CLAIM', `winner-claim:${saved.id}`, {
          boardId,
          winnerId: saved.id
        });
      }

      return saved;
    });

    await this.auditService.log({
      actorUserId: userId,
      action: 'winner.claimed',
      targetType: 'winner',
      targetId: claimedWinner.id,
      metadata: { boardId }
    });

    return claimedWinner;
  }

  findByBoard(boardId: string) {
    return this.winnersRepo.findOne({ where: { board: { id: boardId } }, relations: ['user', 'board', 'entry'] });
  }
}
