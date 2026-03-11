import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreatorBoard } from '../../database/entities/creator-board.entity';
import { Payment, PaymentStatus } from '../../database/entities/payment.entity';
import { BoardStatus } from '../../database/entities/board.entity';

@Injectable()
export class CreatorsService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(CreatorBoard) private creatorBoardsRepo: Repository<CreatorBoard>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>
  ) {}

  async getProfile(creatorId: string) {
    const creator = await this.usersRepo.findOne({ where: { id: creatorId } });
    if (!creator || (creator.role !== UserRole.CREATOR && !creator.isAdmin)) {
      throw new NotFoundException('Creator not found');
    }

    const [boardsCreated, totalEntriesRow, rev] = await Promise.all([
      this.creatorBoardsRepo.count({ where: { creatorUser: { id: creatorId } } }),
      this.creatorBoardsRepo
        .createQueryBuilder('cb')
        .innerJoin('boards', 'b', 'b.id = cb.board_id')
        .select('COALESCE(SUM(b.current_entries), 0)', 'totalEntries')
        .where('cb.creator_user_id = :creatorId', { creatorId })
        .getRawOne<{ totalEntries: string }>(),
      this.paymentsRepo
        .createQueryBuilder('p')
        .innerJoin(CreatorBoard, 'cb', 'cb.board_id = p.board_id')
        .select('COALESCE(SUM(p.amount), 0)', 'totalRevenue')
        .where('cb.creator_user_id = :creatorId', { creatorId })
        .andWhere('p.status = :status', { status: PaymentStatus.SUCCEEDED })
        .getRawOne<{ totalRevenue: string }>()
    ]);

    return {
      creator: { id: creator.id, email: creator.email, xp: creator.xp, prestigeLevel: creator.prestigeLevel },
      stats: {
        boardsCreated,
        totalEntries: Number(totalEntriesRow?.totalEntries || 0),
        totalRevenue: Number(rev?.totalRevenue || 0)
      }
    };
  }

  getBoards(creatorId: string) {
    return this.creatorBoardsRepo.find({ where: { creatorUser: { id: creatorId } }, relations: ['board'], order: { createdAt: 'DESC' } });
  }

  async leaderboard(limit = 50) {
    const rows = await this.creatorBoardsRepo
      .createQueryBuilder('cb')
      .innerJoin('boards', 'b', 'b.id = cb.board_id')
      .leftJoin('payments', 'p', 'p.board_id = b.id AND p.status = :status', { status: PaymentStatus.SUCCEEDED })
      .select('cb.creator_user_id', 'creatorUserId')
      .addSelect('COALESCE(SUM(p.creator_revenue), 0)', 'revenue')
      .addSelect('COALESCE(SUM(b.current_entries), 0)', 'entriesSold')
      .addSelect("AVG(CASE WHEN b.status = :closed THEN b.current_entries::float / NULLIF(b.max_entries,0) ELSE 0 END)", 'boardSuccessRate')
      .setParameter('closed', BoardStatus.CLOSED)
      .groupBy('cb.creator_user_id')
      .orderBy('revenue', 'DESC')
      .addOrderBy('entriesSold', 'DESC')
      .addOrderBy('boardSuccessRate', 'DESC')
      .limit(limit)
      .getRawMany<{ creatorUserId: string; revenue: string; entriesSold: string; boardSuccessRate: string }>();

    return rows.map((row) => ({
      creatorUserId: row.creatorUserId,
      revenue: Number(row.revenue || 0),
      entriesSold: Number(row.entriesSold || 0),
      boardSuccessRate: Number(row.boardSuccessRate || 0)
    }));
  }
}
