import { BoardsService } from './boards.service';
import { BoardStatus } from '../../database/entities/board.entity';

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
      { get: jest.fn(), set: jest.fn(), del: jest.fn() } as any
    );
    const updated = await service.incrementEntryCount('b1');
    expect(updated.status).toBe(BoardStatus.FULL);
  });
});
