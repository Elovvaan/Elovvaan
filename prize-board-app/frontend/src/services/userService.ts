import { api } from './api';
import type { User, UserNotification, WalletLedger } from '../types';

export const userService = {
  me: async () => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
  listUsers: async () => {
    const { data } = await api.get<User[]>('/admin/users');
    return data;
  },
  notifications: async () => {
    const { data } = await api.get<UserNotification[]>('/notifications');
    return data;
  },
  walletLedger: async () => {
    const { data } = await api.get<WalletLedger>('/wallet/ledger');
    return data;
  }
};
