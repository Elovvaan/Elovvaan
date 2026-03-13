import { api } from './api';
import type { User } from '../types';

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
    const { data } = await api.get<string[]>('/notifications');
    return data;
  },
};
