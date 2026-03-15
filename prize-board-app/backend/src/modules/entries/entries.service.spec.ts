import { EntriesService } from './entries.service';
import { BoardStatus } from '../../database/entities/board.entity';

describe('EntriesService', () => {
  it('queues and waits for entry job', async () => {
    const queueService = {
      add: jest.fn().mockResolvedValue({ id: 'entry:p1' }),
      waitForCompletion: jest.fn().mockResolvedValue({ id: 'e1' })
    } as any;

    const service = new EntriesService(
      {} as any,
      {} as any,
      { get: jest.fn().mockResolvedValue({ id: 'b1', status: BoardStatus.OPEN }) } as any,
      { assertPaymentSucceeded: jest.fn().mockResolvedValue({ id: 'p1', entryQuantity: 1 }) } as any,
      { findById: jest.fn().mockResolvedValue({ id: 'u1', isSuspended: false }) } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      queueService,
      { setNx: jest.fn().mockResolvedValue(true), get: jest.fn().mockResolvedValue('p1:1'), del: jest.fn() } as any,
      { track: jest.fn() } as any
    );

    const result = await service.enterBoard('b1', 'u1', 'p1');
    expect(result.id).toBe('e1');
  });
});
