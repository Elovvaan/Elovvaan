import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { Winner } from '../../database/entities/winner.entity';
import { Entry } from '../../database/entities/entry.entity';
import { Board } from '../../database/entities/board.entity';

@Injectable()
export class WinnersService {
  constructor(
    @InjectRepository(Winner) private winnersRepo: Repository<Winner>,
    @InjectRepository(Entry) private entriesRepo: Repository<Entry>,
    @InjectRepository(Board) private boardsRepo: Repository<Board>
  ) {}

  async selectWinner(boardId: string) {
    const existing = await this.findByBoard(boardId);
    if (existing) {
      return existing;
    }

    const board = await this.boardsRepo.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const entries = await this.entriesRepo.find({
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

    return this.winnersRepo.save(this.winnersRepo.create({ board, user: selected.user, entry: selected }));
  }

  findByBoard(boardId: string) {
    return this.winnersRepo.findOne({ where: { board: { id: boardId } }, relations: ['user', 'board', 'entry'] });
  }
}
