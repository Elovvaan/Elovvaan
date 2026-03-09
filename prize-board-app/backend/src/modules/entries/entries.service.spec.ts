import { EntriesService } from './entries.service';
import { BoardStatus } from '../../database/entities/board.entity';

describe('EntriesService', () => {
  it('creates entry and emits events', async () => {
    const entriesRepo = { save: jest.fn().mockResolvedValue({ id: 'e1' }), create: jest.fn(), find: jest.fn().mockResolvedValue([]) } as any;
    const service = new EntriesService(
      entriesRepo,
      { get: jest.fn().mockResolvedValue({ id: 'b1' }), incrementSpots: jest.fn().mockResolvedValue({ id: 'b1', status: BoardStatus.LIVE }) } as any,
      { findById: jest.fn().mockResolvedValue({ id: 'p1' }) } as any,
      { findById: jest.fn().mockResolvedValue({ id: 'u1' }) } as any,
      { selectWinner: jest.fn() } as any,
      { broadcast: jest.fn() } as any
    );

    const result = await service.enterBoard('b1', 'u1', 'p1');
    expect(result.id).toBe('e1');
  });
});
