import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board, BoardStatus } from '../../database/entities/board.entity';
import { Entry } from '../../database/entities/entry.entity';
import { Notification } from '../../database/entities/notification.entity';
import { Payment, PaymentStatus } from '../../database/entities/payment.entity';
import { User } from '../../database/entities/user.entity';
import { Winner } from '../../database/entities/winner.entity';
import { BoardsService } from '../boards/boards.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Board) private boardsRepo: Repository<Board>,
    @InjectRepository(Entry) private entriesRepo: Repository<Entry>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(Winner) private winnersRepo: Repository<Winner>,
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    private boardsService: BoardsService
  ) {}

  async metrics() {
    const [totalUsers, totalBoards, activeBoards, totalEntries, totalPayments, totalWinners] = await Promise.all([
      this.usersRepo.count(),
      this.boardsRepo.count(),
      this.boardsRepo.count({ where: { status: BoardStatus.OPEN } }),
      this.entriesRepo.count(),
      this.paymentsRepo.count(),
      this.winnersRepo.count()
    ]);

    const entriesPerBoard = await this.entriesRepo
      .createQueryBuilder('entry')
      .select('entry.boardId', 'boardId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('entry.boardId')
      .getRawMany();

    const revenuePerBoard = await this.paymentsRepo
      .createQueryBuilder('payment')
      .select('payment.boardId', 'boardId')
      .addSelect('SUM(payment.amount)', 'revenue')
      .where('payment.status = :status', { status: PaymentStatus.SUCCEEDED })
      .groupBy('payment.boardId')
      .getRawMany();

    const dailyActiveUsers = await this.entriesRepo
      .createQueryBuilder('entry')
      .select('COUNT(DISTINCT entry.userId)', 'dau')
      .where("entry.created_at >= NOW() - INTERVAL '1 day'")
      .getRawOne();

    return {
      totalUsers,
      totalBoards,
      activeBoards,
      totalEntries,
      totalPayments,
      totalWinners,
      dailyActiveUsers: Number(dailyActiveUsers?.dau || 0),
      entriesPerBoard,
      revenuePerBoard,
      conversionRate: totalUsers ? totalPayments / totalUsers : 0
    };
  }

  listEntries(boardId: string) {
    return this.entriesRepo.find({
      where: { board: { id: boardId } },
      relations: ['payment', 'user'],
      order: { createdAt: 'DESC' }
    });
  }

  listWinners() {
    return this.winnersRepo.find({ relations: ['board', 'entry', 'user'], order: { createdAt: 'DESC' } });
  }

  listNotifications() {
    return this.notificationsRepo.find({ order: { createdAt: 'DESC' } });
  }

  closeBoard(boardId: string) {
    return this.boardsService.closeBoard(boardId);
  }
}
