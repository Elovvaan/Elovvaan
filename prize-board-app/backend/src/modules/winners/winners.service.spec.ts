import { createHash } from 'crypto';
import { WinnersService } from './winners.service';

describe('WinnersService', () => {
  it('selects a deterministic winner based on board id and closing timestamp', async () => {
    const entries = [
      { id: 'e1', user: { id: 'u1' }, createdAt: new Date('2026-01-01T00:00:00.000Z') },
      { id: 'e2', user: { id: 'u2' }, createdAt: new Date('2026-01-02T00:00:00.000Z') },
      { id: 'e3', user: { id: 'u3' }, createdAt: new Date('2026-01-03T00:00:00.000Z') }
    ] as any[];

    const winnersRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((payload) => payload),
      save: jest.fn().mockImplementation(async (payload) => ({ id: 'w1', ...payload }))
    } as any;

    const service = new WinnersService(
      winnersRepo,
      { find: jest.fn().mockResolvedValue(entries) } as any,
      { findOne: jest.fn().mockResolvedValue({ id: 'board-1', createdAt: new Date('2025-12-31T00:00:00.000Z') }) } as any
    );

    const seed = createHash('sha256').update('board-1:2026-01-03T00:00:00.000Z').digest('hex');
    const expectedIndex = Number.parseInt(seed.slice(0, 12), 16) % entries.length;

    const winner = await service.selectWinner('board-1');

    expect(winner.entry.id).toBe(entries[expectedIndex].id);
    expect(winner.user.id).toBe(entries[expectedIndex].user.id);
  });

  it('returns existing winner if one already exists', async () => {
    const existingWinner = { id: 'w-existing' };

    const winnersRepo = {
      findOne: jest.fn().mockResolvedValue(existingWinner)
    } as any;

    const service = new WinnersService(winnersRepo, { find: jest.fn() } as any, { findOne: jest.fn() } as any);

    await expect(service.selectWinner('board-1')).resolves.toBe(existingWinner);
  });
});
