import { api } from './api';

interface CreateIntentPayload {
  boardId: string;
  quantity: number;
}

interface CreateIntentResponse {
  paymentIntentId?: string;
  clientSecret?: string;
  status?: string;
  [key: string]: unknown;
}

export const paymentService = {
  createIntent: async (payload: CreateIntentPayload) => {
    const { data } = await api.post<CreateIntentResponse>('/payments/create-intent', payload);
    return data;
  },
};
