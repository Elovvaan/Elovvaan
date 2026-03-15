import { PaymentStatus } from '../database/entities/payment.entity';
import { BoardStatus } from '../database/entities/board.entity';
import { WinnerClaimStatus } from '../database/entities/winner.entity';
import { AuthService } from './auth/auth.service';
import { PaymentsService } from './payments/payments.service';
import { EntriesService } from './entries/entries.service';
import { WinnersService } from './winners/winners.service';
import { AdminService } from './admin/admin.service';

describe('Phase 4/5 critical flows', () => {
  it('auth login -> refresh -> logout lifecycle', async () => {
    const usersService = { findByEmail: jest.fn().mockResolvedValue({ id: 'u1', email: 'user@test.com', passwordHash: await require('bcrypt').hash('pass1234', 1), isAdmin: false, role: 'USER', isSuspended: false }) } as any;
    const sessionsRepo = {
      save: jest.fn().mockImplementation(async (s) => ({ id: s.id || 's1', ...s, user: { id: 'u1', email: 'user@test.com', isAdmin: false, role: 'USER' } })),
      create: jest.fn().mockImplementation((x) => ({ ...x, id: 's1' })),
      findOne: jest.fn().mockResolvedValue({ id: 's1', revokedAt: null, expiresAt: new Date(Date.now() + 10000), refreshTokenHash: await require('bcrypt').hash('refresh-token', 1), user: { id: 'u1', email: 'user@test.com', isAdmin: false, role: 'USER' } })
    } as any;
    const jwtService = {
      sign: jest.fn().mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token').mockReturnValueOnce('access-token-2').mockReturnValueOnce('refresh-token-2'),
      verify: jest.fn().mockReturnValue({ sub: 'u1', sessionId: 's1' })
    } as any;

    const service = new AuthService(usersService, jwtService, { createReferral: jest.fn() } as any, { get: jest.fn().mockReturnValue(undefined) } as any, { log: jest.fn() } as any, sessionsRepo);
    const login = await service.login({ email: 'user@test.com', password: 'pass1234' });
    const refreshed = await service.refreshSession('refresh-token');
    const logout = await service.logout('refresh-token-2');

    expect(login.accessToken).toBeDefined();
    expect(refreshed.accessToken).toBeDefined();
    expect(logout.ok).toBe(true);
  });

  it('stripe success -> wallet credit/debit -> notify -> analytics -> entry job', async () => {
    const queue = { add: jest.fn() } as any;
    const wallet = { credit: jest.fn(), debit: jest.fn() } as any;
    const notifications = { notify: jest.fn() } as any;
    const analytics = { track: jest.fn() } as any;
    const paymentEventsRepo = { findOne: jest.fn().mockResolvedValue({ providerEventId: 'evt1', isProcessed: false }), save: jest.fn() } as any;
    const payment = { id: 'p1', userId: 'u1', boardId: 'b1', amount: 5, entryQuantity: 1 };
    const service = new PaymentsService(
      { get: jest.fn().mockReturnValue('x') } as any,
      { findOne: jest.fn().mockResolvedValue(payment), save: jest.fn().mockImplementation(async (p:any)=>p) } as any,
      { count: jest.fn().mockResolvedValue(1) } as any,
      { findOne: jest.fn() } as any,
      paymentEventsRepo,
      { awardXp: jest.fn() } as any,
      { applyEscrowRevenue: jest.fn() } as any,
      queue,
      { findByReferredUser: jest.fn().mockResolvedValue(null) } as any,
      notifications,
      { log: jest.fn() } as any,
      wallet,
      analytics
    );

    await service.processPaymentJob({ eventId: 'evt1', paymentIntentId: 'pi1', eventType: 'payment_intent.succeeded' });
    expect(wallet.credit).toHaveBeenCalled();
    expect(notifications.notify).toHaveBeenCalled();
    expect(analytics.track).toHaveBeenCalledWith(expect.objectContaining({ eventName: 'payment_succeeded' }));
    expect(queue.add).toHaveBeenCalledWith(expect.stringContaining('entry-processing'), expect.any(String), expect.any(Object), expect.any(Object));
  });

  it('board entry full path enqueues winner job', async () => {
    const queue = { add: jest.fn(), waitForCompletion: jest.fn() } as any;
    const entriesService = new EntriesService(
      {} as any,
      {
        transaction: jest.fn().mockImplementation(async (cb:any)=> cb({
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue({ id: 'b1', status: BoardStatus.OPEN, currentEntries: 0, maxEntries: 1, title: 'Board' }),
            find: jest.fn().mockResolvedValue([]),
            count: jest.fn().mockResolvedValue(0),
            create: jest.fn().mockImplementation((x:any)=>x),
            save: jest.fn().mockImplementation(async (x:any)=>x)
          }),
          createQueryBuilder: () => ({ select: () => ({ from: () => ({ where: () => ({ getRawOne: async () => ({ count: '0' }) }) }) }) })
        }))
      } as any,
      { get: jest.fn(), incrementEntryCount: jest.fn().mockResolvedValue({ id: 'b1', status: BoardStatus.FULL, maxEntries: 1, currentEntries: 1, title: 'Board' }), recordActivity: jest.fn() } as any,
      { assertPaymentSucceeded: jest.fn().mockResolvedValue({ id: 'p1' }) } as any,
      { findById: jest.fn().mockResolvedValue({ id: 'u1' }), awardXp: jest.fn().mockResolvedValue({ xp: 1, prestigeLevel: 0 }) } as any,
      { selectWinner: jest.fn() } as any,
      { broadcast: jest.fn() } as any,
      { notify: jest.fn() } as any,
      { save: jest.fn(), create: jest.fn() } as any,
      queue,
      { setNx: jest.fn().mockResolvedValue(true), get: jest.fn().mockResolvedValue('p1:1'), del: jest.fn(), set: jest.fn() } as any,
      { track: jest.fn() } as any
    );

    await entriesService.processEntryJob({ boardId: 'b1', userId: 'u1', paymentId: 'p1', quantity: 1 });
    expect(queue.add).toHaveBeenCalledWith(expect.stringContaining('winner-processing'), 'select-winner', { boardId: 'b1' }, expect.any(Object));
  });

  it('winner selection then claim credits winner wallet', async () => {
    const winnersRepo = { findOne: jest.fn().mockResolvedValue(null), create: jest.fn().mockImplementation((x:any)=>x), save: jest.fn().mockImplementation(async (x:any)=>({ id: 'w1', ...x })) } as any;
    const service = new WinnersService(
      winnersRepo,
      { find: jest.fn().mockResolvedValue([{ id: 'e1', user: { id: 'u1' }, createdAt: new Date() }]) } as any,
      { findOne: jest.fn().mockResolvedValue({ id: 'b1', createdAt: new Date(), prizeValue: 5 }) } as any,
      { transaction: jest.fn().mockImplementation(async (cb:any)=> cb({ getRepository: (entity:any) => {
          if (entity?.name === 'Winner') return winnersRepo;
          if (entity?.name === 'Board') return { findOne: jest.fn().mockResolvedValue({ id: 'b1', createdAt: new Date(), prizeValue: 5 }) };
          return { find: jest.fn().mockResolvedValue([{ id: 'e1', user: { id: 'u1' }, createdAt: new Date() }]) };
        } })) } as any,
      { log: jest.fn() } as any,
      { credit: jest.fn() } as any
    );

    await service.selectWinner('b1');
    service.findByBoard = jest.fn().mockResolvedValue({ id: 'w1', boardId: 'b1', userId: 'u1', claimStatus: WinnerClaimStatus.PENDING });
    (service as any).dataSource.transaction = jest.fn().mockImplementation(async (cb:any)=> cb({
      getRepository: (entity:any) => {
        if (entity?.name === 'Winner') {
          return {
            findOne: jest.fn().mockResolvedValue({ id:'w1', boardId: 'b1', claimStatus: WinnerClaimStatus.PENDING }),
            save: jest.fn().mockResolvedValue({ id:'w1', boardId:'b1', claimStatus: WinnerClaimStatus.CLAIMED })
          };
        }
        return { findOne: jest.fn().mockResolvedValue({ id: 'b1', prizeValue: 10 }) };
      }
    }));
    await service.claimWinner('b1', 'u1');
    expect((service as any).walletService.credit).toHaveBeenCalled();
  });

  it('admin wallet adjustment and fraud note write audit logs', async () => {
    const audit = { log: jest.fn() } as any;
    const service = new AdminService(
      { findOne: jest.fn().mockResolvedValue({ id: 'u1', walletBalance: 0 }), save: jest.fn().mockImplementation(async (u:any)=>u) } as any,
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any,
      { save: jest.fn().mockImplementation(async (x:any)=>({ id: 'f1', ...x })), create: jest.fn().mockImplementation((x:any)=>x, ) } as any,
      {} as any,
      {} as any,
      audit,
      { enqueueDailyAggregation: jest.fn() } as any
    );

    await service.adjustWallet('admin1', 'u1', 10, 'manual correction');
    await service.addFraudNote('admin1', 'u1', 'suspicious velocity');
    expect(audit.log).toHaveBeenCalledTimes(2);
  });
});
