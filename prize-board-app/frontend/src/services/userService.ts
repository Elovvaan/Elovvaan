import { api } from './api';
import type { Entry, NotificationItem, User, Win } from '../types';

export const userService = {
  dashboard: async () => {
    const { data } = await api.get<{ entries: Entry[]; wins: Win[]; xp: number }>('/user/dashboard');
    return data;
  },
  referrals: async () => {
    const { data } = await api.get<{ referralLink: string; xpRewards: string[] }>('/user/referrals');
    return data;
  },
  notifications: async () => {
    const { data } = await api.get<NotificationItem[]>('/user/notifications');
    return data;
  },
  listUsers: async () => {
    const { data } = await api.get<User[]>('/admin/users');
    return data;
  },
  entryLogs: async () => {
    const { data } = await api.get('/admin/entries');
    return data;
  },
};
