import { api } from './api';
import type { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
  signup: async (name: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/signup', { name, email, password });
    return data;
  },
  adminLogin: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/admin/login', { email, password });
    return data;
  },
};
