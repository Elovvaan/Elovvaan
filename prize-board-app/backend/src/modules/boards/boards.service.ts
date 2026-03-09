import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (cached) return JSON.parse(cached);
    const boards = await this.boardsRepo.find({ order: { createdAt: 'DESC' } });
    await this.redis.set(cacheKey, JSON.stringify(boards));
    return boards;
  }

  async get(id: string) {
    const board = await this.boardsRepo.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  create(dto: CreateBoardDto) {
    return this.boardsRepo.save(this.boardsRepo.create({ ...dto, status: BoardStatus.LIVE }));
  }

  async incrementSpots(boardId: string) {
    const board = await this.get(boardId);
    board.spotsFilled += 1;
    if (board.spotsFilled >= board.totalSpots) board.status = BoardStatus.FULL;
    return this.boardsRepo.save(board);
  }
}
