import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board, BoardStatus } from '../../database/entities/board.entity';
import { CreateBoardDto } from './dto';
import { RedisService } from '../../common/redis.service';

@Injectable()
export class BoardsService {
  constructor(@InjectRepository(Board) private boardsRepo: Repository<Board>, private redis: RedisService) {}

  async list() {
    const cacheKey = 'boards:list';
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Board[];
    }

    const boards = await this.boardsRepo.find({ order: { createdAt: 'DESC' } });
    await this.redis.set(cacheKey, JSON.stringify(boards));
    return boards;
  }

  async get(id: string) {
    const board = await this.boardsRepo.findOne({ where: { id } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async create(dto: CreateBoardDto) {
    const board = this.boardsRepo.create({
      ...dto,
      currentEntries: 0,
      status: BoardStatus.OPEN
    });

    const created = await this.boardsRepo.save(board);
    await this.redis.del('boards:list');

    return created;
  }

  async incrementEntryCount(boardId: string) {
    const board = await this.get(boardId);

    if (board.status !== BoardStatus.OPEN) {
      throw new BadRequestException('Board is not open for entries');
    }

    if (board.currentEntries >= board.maxEntries) {
      board.status = BoardStatus.FULL;
      await this.boardsRepo.save(board);
      throw new BadRequestException('Board is full');
    }

    board.currentEntries += 1;
    if (board.currentEntries >= board.maxEntries) {
      board.status = BoardStatus.FULL;
    }

    const updated = await this.boardsRepo.save(board);
    await this.redis.del('boards:list');

    return updated;
  }

  async closeBoard(boardId: string) {
    const board = await this.get(boardId);
    board.status = BoardStatus.CLOSED;
    const updated = await this.boardsRepo.save(board);
    await this.redis.del('boards:list');
    return updated;
  }
}
