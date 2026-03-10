import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

    const entries = await this.entriesRepo.find({ where: { board: { id: boardId } }, relations: ['user'] });
    if (entries.length === 0) {
      throw new BadRequestException('Cannot select winner without entries');
    }

    const randomIndex = Math.floor(Math.random() * entries.length);
    const selected = entries[randomIndex];

    return this.winnersRepo.save(this.winnersRepo.create({ board, user: selected.user, entry: selected }));
  }

  findByBoard(boardId: string) {
    return this.winnersRepo.findOne({ where: { board: { id: boardId } }, relations: ['user', 'board', 'entry'] });
  }
}
