import { BoardsService } from './boards.service';
import { BoardStatus } from '../../database/entities/board.entity';

describe('BoardsService', () => {
  it('marks board full when spots reach total', async () => {
    const board = { id: 'b1', spotsFilled: 0, totalSpots: 1, status: BoardStatus.LIVE } as any;
    const repo = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(board),
      save: jest.fn().mockImplementation((b) => Promise.resolve(b)),
      create: jest.fn()
    } as any;
    const service = new BoardsService(repo, { get: jest.fn(), set: jest.fn() } as any);
    const updated = await service.incrementSpots('b1');
    expect(updated.status).toBe(BoardStatus.FULL);
  });
});
