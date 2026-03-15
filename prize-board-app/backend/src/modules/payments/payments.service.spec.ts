import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  it('queues webhook events', async () => {
    const queueService = { add: jest.fn().mockResolvedValue(undefined) } as any;
    const paymentEventsRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockImplementation((arg) => arg)
    } as any;

    const service = new PaymentsService(
      { get: jest.fn().mockImplementation((key: string) => (key === 'STRIPE_WEBHOOK_SECRET' ? 'whsec_test' : 'sk_test')) } as any,
      { findOne: jest.fn(), save: jest.fn(), create: jest.fn() } as any,
      { count: jest.fn().mockResolvedValue(0) } as any,
      { findOne: jest.fn() } as any,
      paymentEventsRepo,
      {} as any,
      {} as any,
      queueService,
      { findByReferredUser: jest.fn() } as any,
      { notify: jest.fn() } as any,
      { log: jest.fn() } as any,
      { track: jest.fn() } as any
    );

    (service as any).stripe = {
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({
          id: 'evt_1',
          type: 'payment_intent.succeeded',
          data: { object: { id: 'pi_1' } }
        })
      }
    };

    await service.processWebhook('sig', Buffer.from('payload'));
    expect(queueService.add).toHaveBeenCalled();
  });
});
