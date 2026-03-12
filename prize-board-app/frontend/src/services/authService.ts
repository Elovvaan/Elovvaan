import { api } from './api';
import type { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  signup: async (payload: { name: string; email: string; password: string }) => {
    const { data } = await api.post<AuthResponse>('/auth/signup', payload);
    return data;
  },
  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  profile: async () => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
