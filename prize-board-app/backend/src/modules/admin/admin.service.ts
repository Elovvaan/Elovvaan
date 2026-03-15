import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board, BoardStatus, PrizeVerificationStatus } from '../../database/entities/board.entity';
import { Entry, EntryReviewStatus } from '../../database/entities/entry.entity';
import { Notification } from '../../database/entities/notification.entity';
import { Payment, PaymentStatus } from '../../database/entities/payment.entity';
import { User } from '../../database/entities/user.entity';
import { Winner } from '../../database/entities/winner.entity';
import { BoardsService } from '../boards/boards.service';
import { CreatorBoard } from '../../database/entities/creator-board.entity';
import { Payout, PayoutStatus } from '../../database/entities/payout.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../../common/audit/audit.service';
import { FraudNote } from '../../database/entities/fraud-note.entity';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Board) private boardsRepo: Repository<Board>,
    @InjectRepository(Entry) private entriesRepo: Repository<Entry>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(Winner) private winnersRepo: Repository<Winner>,
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    @InjectRepository(CreatorBoard) private creatorBoardsRepo: Repository<CreatorBoard>,
    @InjectRepository(Payout) private payoutsRepo: Repository<Payout>,
    @InjectRepository(FraudNote) private fraudNotesRepo: Repository<FraudNote>,
    private boardsService: BoardsService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private analyticsService: AnalyticsService
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

    return { totalUsers, totalBoards, activeBoards, totalEntries, totalPayments, totalWinners, conversionRate: totalUsers ? totalPayments / totalUsers : 0 };
  }

  listEntries(boardId: string) { return this.entriesRepo.find({ where: { board: { id: boardId } }, relations: ['payment', 'user'], order: { createdAt: 'DESC' } }); }
  listWinners() { return this.winnersRepo.find({ relations: ['board', 'entry', 'user'], order: { createdAt: 'DESC' } }); }
  listNotifications() { return this.notificationsRepo.find({ order: { createdAt: 'DESC' } }); }
  closeBoard(boardId: string) { return this.boardsService.closeBoard(boardId); }
  creatorBoards(creatorUserId: string) { return this.creatorBoardsRepo.find({ where: { creatorUser: { id: creatorUserId } }, relations: ['board'], order: { createdAt: 'DESC' } }); }

  async creatorBoardStats(creatorUserId: string, boardId: string) {
    const creatorBoard = await this.creatorBoardsRepo.findOne({ where: { creatorUser: { id: creatorUserId }, board: { id: boardId } } });
    if (!creatorBoard) throw new BadRequestException('Board not found for creator');

    const [entriesSold, paymentAgg, board] = await Promise.all([
      this.entriesRepo.count({ where: { board: { id: boardId } } }),
      this.paymentsRepo.createQueryBuilder('p').select('COALESCE(SUM(p.amount),0)', 'boardRevenue').addSelect('COALESCE(SUM(p.platformRevenue),0)', 'platformRevenue').addSelect('COALESCE(SUM(p.creatorRevenue),0)', 'creatorRevenue').where('p.board_id = :boardId', { boardId }).andWhere('p.status = :status', { status: PaymentStatus.SUCCEEDED }).getRawOne<{ boardRevenue: string; platformRevenue: string; creatorRevenue: string }>(),
      this.boardsRepo.findOne({ where: { id: boardId } })
    ]);

    return { boardId, entriesSold, boardRevenue: Number(paymentAgg?.boardRevenue || 0), platformRevenue: Number(paymentAgg?.platformRevenue || 0), creatorRevenue: Number(paymentAgg?.creatorRevenue || 0), conversionRate: board?.maxEntries ? entriesSold / board.maxEntries : 0 };
  }

  async creatorRevenue(creatorUserId: string) {
    const rows = await this.paymentsRepo.createQueryBuilder('p').innerJoin(CreatorBoard, 'cb', 'cb.board_id = p.board_id').select('COALESCE(SUM(p.amount),0)', 'boardRevenue').addSelect('COALESCE(SUM(p.platformRevenue),0)', 'platformRevenue').addSelect('COALESCE(SUM(p.creatorRevenue),0)', 'creatorRevenue').where('cb.creator_user_id = :creatorUserId', { creatorUserId }).andWhere('p.status = :status', { status: PaymentStatus.SUCCEEDED }).getRawOne<{ boardRevenue: string; platformRevenue: string; creatorRevenue: string }>();
    return { boardRevenue: Number(rows?.boardRevenue || 0), platformRevenue: Number(rows?.platformRevenue || 0), creatorRevenue: Number(rows?.creatorRevenue || 0) };
  }

  async requestPayout(creatorUserId: string, amount: number) {
    const releasable = await this.boardsRepo.createQueryBuilder('b').select('COALESCE(SUM(b.creator_share),0)', 'creatorShare').where('b.creator_user_id = :creatorUserId', { creatorUserId }).andWhere('b.status = :status', { status: BoardStatus.CLOSED }).andWhere('b.escrow_released = true').getRawOne<{ creatorShare: string }>();
    const alreadyRequested = await this.payoutsRepo.createQueryBuilder('p').select('COALESCE(SUM(p.amount),0)', 'amount').where('p.creator_user_id = :creatorUserId', { creatorUserId }).andWhere('p.status IN (:...statuses)', { statuses: [PayoutStatus.PENDING, PayoutStatus.APPROVED, PayoutStatus.PAID] }).getRawOne<{ amount: string }>();
    const available = Number(releasable?.creatorShare || 0) - Number(alreadyRequested?.amount || 0);
    if (amount <= 0 || amount > available) throw new BadRequestException('Insufficient released escrow balance');
    return this.payoutsRepo.save(this.payoutsRepo.create({ creatorUserId, amount, status: PayoutStatus.PENDING }));
  }

  async verifyBoardPrize(boardId: string, verificationStatus: PrizeVerificationStatus) { return this.boardsService.setVerificationStatus(boardId, verificationStatus); }
  fraudEntries() { return this.entriesRepo.find({ where: { reviewStatus: EntryReviewStatus.FLAGGED }, relations: ['user', 'board', 'payment'], order: { createdAt: 'DESC' } }); }
  listPayouts() { return this.payoutsRepo.find({ order: { createdAt: 'DESC' } }); }

  async approvePayout(id: string) {
    const payout = await this.payoutsRepo.findOne({ where: { id } });
    if (!payout) throw new BadRequestException('Payout not found');
    payout.status = PayoutStatus.APPROVED;
    const updated = await this.payoutsRepo.save(payout);
    await this.notificationsService.notify(updated.creatorUserId, 'PAYOUT_APPROVED', `Payout ${updated.id} approved`);
    return updated;
  }

  async creatorMetrics() {
    const revenuePerCreator = await this.paymentsRepo.createQueryBuilder('p').innerJoin(CreatorBoard, 'cb', 'cb.board_id = p.board_id').select('cb.creator_user_id', 'creatorUserId').addSelect('COALESCE(SUM(p.creatorRevenue),0)', 'creatorRevenue').where('p.status = :status', { status: PaymentStatus.SUCCEEDED }).groupBy('cb.creator_user_id').orderBy('creatorRevenue', 'DESC').getRawMany();
    const topBoards = await this.paymentsRepo.createQueryBuilder('p').select('p.board_id', 'boardId').addSelect('COALESCE(SUM(p.amount),0)', 'boardRevenue').where('p.status = :status', { status: PaymentStatus.SUCCEEDED }).groupBy('p.board_id').orderBy('boardRevenue', 'DESC').limit(10).getRawMany();
    return { revenuePerCreator, topBoards };
  }

  async suspendUser(adminUserId: string, userId: string, reason: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isSuspended = true;
    user.suspendedReason = reason;
    user.suspendedAt = new Date();
    const updated = await this.usersRepo.save(user);
    await this.auditService.log({ actorUserId: adminUserId, action: 'admin.user.suspended', targetType: 'user', targetId: userId, metadata: { reason } });
    return updated;
  }

  async lookupTransaction(adminUserId: string, query: string) {
    const payment = await this.paymentsRepo.findOne({ where: [{ id: query }, { stripePaymentIntentId: query }], relations: ['user', 'board'] });
    await this.auditService.log({ actorUserId: adminUserId, action: 'admin.transaction.lookup', targetType: 'payment', targetId: payment?.id, metadata: { query, found: Boolean(payment) } });
    return payment;
  }

  async adjustWallet(adminUserId: string, userId: string, amountDelta: number, reason: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.walletBalance = Number(user.walletBalance || 0) + amountDelta;
    const updated = await this.usersRepo.save(user);
    await this.auditService.log({ actorUserId: adminUserId, action: 'admin.wallet.adjusted', targetType: 'user', targetId: userId, metadata: { amountDelta, reason, resultingBalance: updated.walletBalance } });
    return updated;
  }

  async addFraudNote(adminUserId: string, userId: string, note: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const created = await this.fraudNotesRepo.save(this.fraudNotesRepo.create({ adminUserId, userId, note }));
    await this.auditService.log({ actorUserId: adminUserId, action: 'admin.fraud.note_added', targetType: 'user', targetId: userId, metadata: { fraudNoteId: created.id } });
    return created;
  }

  getFraudNotes(userId: string) {
    return this.fraudNotesRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }


  async enqueueDailyMetricsAggregation(adminUserId: string, day: string) {
    await this.auditService.log({ actorUserId: adminUserId, action: 'admin.analytics.aggregate', targetType: 'daily_metrics', targetId: day });
    return this.analyticsService.enqueueDailyAggregation(day);
  }
}

