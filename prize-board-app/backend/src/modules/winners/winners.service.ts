import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Winner } from '../../database/entities/winner.entity';
import { Entry } from '../../database/entities/entry.entity';
import { Board } from '../../database/entities/board.entity';

@Injectable()
export class WinnersService {
  constructor(@InjectRepository(Winner) private winnersRepo: Repository<Winner>) {}

  async selectWinner(board: Board, entries: Entry[]) {
    const randomIndex = Math.floor(Math.random() * entries.length);
    const selected = entries[randomIndex];
    return this.winnersRepo.save(
      this.winnersRepo.create({ board, user: selected.user, rngResult: JSON.stringify({ randomIndex, totalEntries: entries.length }) })
    );
  }

  findByBoard(boardId: string) {
    return this.winnersRepo.findOne({ where: { board: { id: boardId } }, relations: ['user', 'board'] });
  }
}
