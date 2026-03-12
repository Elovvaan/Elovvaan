import { api } from './api';

export const paymentService = {
  createIntent: async (payload: { boardId: string; quantity: number }) => {
    const { data } = await api.post<{ clientSecret: string; paymentId: string }>('/payments/create-intent', payload);
    return data;
  },
  getPaymentLogs: async () => {
    const { data } = await api.get('/admin/payments');
    return data;
  },
};
