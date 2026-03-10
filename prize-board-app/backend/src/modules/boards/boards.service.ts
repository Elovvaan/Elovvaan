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
    await this.redis.set(cacheKey, JSON.stringify(boards), 20);
    return boards;
  }

  async get(id: string) {
    const cacheKey = `boards:detail:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Board;
    }

    const board = await this.boardsRepo.findOne({ where: { id } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.redis.set(cacheKey, JSON.stringify(board), 20);
    return board;
  }

  async create(dto: CreateBoardDto) {
    const board = this.boardsRepo.create({
      ...dto,
      currentEntries: 0,
      status: BoardStatus.OPEN
    });

    const created = await this.boardsRepo.save(board);
    await this.redis.del('boards:list', 'boards:trending');

    return created;
  }

  async incrementEntryCount(boardId: string, quantity = 1) {
    const board = await this.get(boardId);

    if (board.status !== BoardStatus.OPEN) {
      throw new BadRequestException('Board is not open for entries');
    }

    if (board.currentEntries + quantity > board.maxEntries) {
      board.status = BoardStatus.FULL;
      await this.boardsRepo.save(board);
      throw new BadRequestException('Board is full');
    }

    board.currentEntries += quantity;
    if (board.currentEntries >= board.maxEntries) {
      board.status = BoardStatus.FULL;
    }

    const updated = await this.boardsRepo.save(board);
    await this.redis.del('boards:list', `boards:detail:${boardId}`, 'boards:trending');

    return updated;
  }

  async trending() {
    const cacheKey = 'boards:trending';
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Board[];
    }

    const boards = await this.boardsRepo
      .createQueryBuilder('board')
      .orderBy('(board.current_entries::float / NULLIF(board.max_entries, 0))', 'DESC')
      .addOrderBy('board.current_entries', 'DESC')
      .addOrderBy('board.created_at', 'DESC')
      .limit(20)
      .getMany();

    await this.redis.set(cacheKey, JSON.stringify(boards), 15);
    return boards;
  }

  async closeBoard(boardId: string) {
    const board = await this.get(boardId);
    board.status = BoardStatus.CLOSED;
    const updated = await this.boardsRepo.save(board);
    await this.redis.del('boards:list', `boards:detail:${boardId}`, 'boards:trending');
    return updated;
  }
}
