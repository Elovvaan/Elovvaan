import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board, BoardStatus, PrizeVerificationStatus } from '../../database/entities/board.entity';
import { CreateBoardDto, CreateCreatorBoardDto } from './dto';
import { RedisService } from '../../common/redis.service';
import { CreatorBoard } from '../../database/entities/creator-board.entity';
import { User } from '../../database/entities/user.entity';
import { BoardActivity } from '../../database/entities/board-activity.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boardsRepo: Repository<Board>,
    @InjectRepository(CreatorBoard) private creatorBoardsRepo: Repository<CreatorBoard>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(BoardActivity) private boardActivityRepo: Repository<BoardActivity>,
    private redis: RedisService
  ) {}

  async list() {
    const cacheKey = 'boards:list';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as Board[];
    const boards = await this.boardsRepo.find({ order: { createdAt: 'DESC' } });
    await this.redis.set(cacheKey, JSON.stringify(boards), 20);
    return boards;
  }

  async get(id: string) {
    const cacheKey = `boards:detail:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as Board;

    const board = await this.boardsRepo.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Board not found');

    await this.redis.set(cacheKey, JSON.stringify(board), 20);
    return board;
  }

  async create(dto: CreateBoardDto) {
    const board = this.boardsRepo.create({ ...dto, currentEntries: 0, status: BoardStatus.OPEN });
    const created = await this.boardsRepo.save(board);
    await this.redis.del('boards:list', 'boards:trending');
    return created;
  }

  async createCreatorBoard(creatorUserId: string, dto: CreateCreatorBoardDto) {
    const creator = await this.usersRepo.findOne({ where: { id: creatorUserId } });
    if (!creator) throw new NotFoundException('Creator not found');

    const board = await this.boardsRepo.save(
      this.boardsRepo.create({
        title: dto.title,
        description: dto.description,
        pricePerEntry: dto.entryPrice,
        maxEntries: dto.maxEntries,
        currentEntries: 0,
        prizeDescription: dto.prizeDescription,
        prizeValue: dto.prizeValue,
        prizeImageUrl: dto.prizeImageUrl,
        creatorUser: creator,
        status: BoardStatus.CLOSED,
        verificationStatus: PrizeVerificationStatus.PENDING
      })
    );

    const creatorBoard = await this.creatorBoardsRepo.save(
      this.creatorBoardsRepo.create({
        creatorUser: creator,
        board,
        entryPrice: dto.entryPrice,
        maxEntries: dto.maxEntries,
        platformFeePercent: dto.platformFeePercent,
        prizeDescription: dto.prizeDescription
      })
    );

    await this.redis.del('boards:list', 'boards:trending');
    return creatorBoard;
  }

  async incrementEntryCount(boardId: string, quantity = 1) {
    const board = await this.get(boardId);
    if (board.status !== BoardStatus.OPEN) throw new BadRequestException('Board is not open for entries');
    if (board.currentEntries + quantity > board.maxEntries) {
      board.status = BoardStatus.FULL;
      await this.boardsRepo.save(board);
      throw new BadRequestException('Board is full');
    }

    board.currentEntries += quantity;
    if (board.currentEntries >= board.maxEntries) board.status = BoardStatus.FULL;

    const updated = await this.boardsRepo.save(board);
    await this.redis.del('boards:list', `boards:detail:${boardId}`, 'boards:trending');
    return updated;
  }

  async trending() {
    const cacheKey = 'boards:trending';
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as Board[];

    const boards = await this.boardsRepo
      .createQueryBuilder('board')
      .where('board.verification_status = :verificationStatus', { verificationStatus: PrizeVerificationStatus.VERIFIED })
      .orderBy('(board.current_entries::float / NULLIF(board.max_entries, 0))', 'DESC')
      .addOrderBy('board.current_entries', 'DESC')
      .addOrderBy('board.created_at', 'DESC')
      .limit(20)
      .getMany();

    await this.redis.set(cacheKey, JSON.stringify(boards), 15);
    return boards;
  }

  creatorBoards(creatorUserId: string) {
    return this.creatorBoardsRepo.find({ where: { creatorUser: { id: creatorUserId } }, relations: ['board'], order: { createdAt: 'DESC' } });
  }

  async closeBoard(boardId: string) {
    const board = await this.get(boardId);
    board.status = BoardStatus.CLOSED;
    const updated = await this.boardsRepo.save(board);
    await this.redis.del('boards:list', `boards:detail:${boardId}`, 'boards:trending');
    return updated;
  }

  async setVerificationStatus(boardId: string, verificationStatus: PrizeVerificationStatus) {
    const board = await this.get(boardId);
    board.verificationStatus = verificationStatus;
    board.status = verificationStatus === PrizeVerificationStatus.VERIFIED ? BoardStatus.OPEN : BoardStatus.CLOSED;
    const updated = await this.boardsRepo.save(board);
    await this.redis.del('boards:list', `boards:detail:${boardId}`, 'boards:trending');
    return updated;
  }

  async recordActivity(boardId: string, eventType: string, payload: Record<string, unknown>) {
    return this.boardActivityRepo.save(this.boardActivityRepo.create({ board: { id: boardId } as Board, eventType, payload }));
  }

  activity(boardId: string) {
    return this.boardActivityRepo.find({ where: { board: { id: boardId } }, order: { createdAt: 'DESC' }, take: 100 });
  }

  async applyEscrowRevenue(boardId: string, boardRevenue: number, creatorShare: number, platformShare: number) {
    const board = await this.get(boardId);
    board.boardRevenue = Number(board.boardRevenue || 0) + boardRevenue;
    board.creatorShare = Number(board.creatorShare || 0) + creatorShare;
    board.platformShare = Number(board.platformShare || 0) + platformShare;
    await this.boardsRepo.save(board);
    await this.redis.del(`boards:detail:${boardId}`);
  }

  async markEscrowReleased(boardId: string) {
    const board = await this.get(boardId);
    board.escrowReleased = true;
    return this.boardsRepo.save(board);
  }
}
