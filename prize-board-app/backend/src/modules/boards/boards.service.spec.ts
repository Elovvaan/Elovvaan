import { BoardsService } from './boards.service';
import { BoardStatus, PrizeVerificationStatus } from '../../database/entities/board.entity';

describe('BoardsService', () => {
  it('marks board full when entries reach max', async () => {
    const board = { id: 'b1', currentEntries: 0, maxEntries: 1, status: BoardStatus.OPEN } as any;
    const repo = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(board),
      save: jest.fn().mockImplementation((b) => Promise.resolve(b)),
      create: jest.fn()
    } as any;
    const service = new BoardsService(
      repo,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
      { save: jest.fn(), create: jest.fn(), find: jest.fn() } as any,
      { get: jest.fn(), set: jest.fn(), del: jest.fn() } as any
    );
    const updated = await service.incrementEntryCount('b1');
    expect(updated.status).toBe(BoardStatus.FULL);
  });

  it('opens board only when prize is verified', async () => {
    const board = { id: 'b1', status: BoardStatus.CLOSED, verificationStatus: PrizeVerificationStatus.PENDING } as any;
    const repo = { findOne: jest.fn().mockResolvedValue(board), save: jest.fn().mockImplementation((b) => Promise.resolve(b)) } as any;
    const service = new BoardsService(
      repo,
      {} as any,
      {} as any,
      {} as any,
      { get: jest.fn(), set: jest.fn(), del: jest.fn() } as any
    );

    const updated = await service.setVerificationStatus('b1', PrizeVerificationStatus.VERIFIED);
    expect(updated.status).toBe(BoardStatus.OPEN);
  });
});
