import { PaymentsService } from './payments.service';
import { PaymentStatus } from '../../database/entities/payment.entity';

describe('PaymentsService', () => {
  it('ignores duplicate webhook events by event id', async () => {
    const service = new PaymentsService(
      { get: jest.fn().mockImplementation((key: string) => (key === 'STRIPE_WEBHOOK_SECRET' ? 'whsec_test' : 'sk_test')) } as any,
      { findOne: jest.fn(), save: jest.fn(), create: jest.fn() } as any,
      {} as any,
      {} as any
    );

    const constructEvent = jest.fn().mockReturnValue({
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_1' } }
    });

    (service as any).stripe = { webhooks: { constructEvent } };
    const updateStatusByIntentId = jest.spyOn(service, 'updateStatusByIntentId').mockResolvedValue({} as any);

    await service.processWebhook('sig', Buffer.from('payload'));
    await service.processWebhook('sig', Buffer.from('payload'));

    expect(constructEvent).toHaveBeenCalledTimes(2);
    expect(updateStatusByIntentId).toHaveBeenCalledTimes(1);
    expect(updateStatusByIntentId).toHaveBeenCalledWith('pi_1', PaymentStatus.SUCCEEDED);
  });
});
