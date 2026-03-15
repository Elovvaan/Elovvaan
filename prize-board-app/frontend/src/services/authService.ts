import { api } from './api';
import type { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

const AUTH_ENDPOINTS = {
  adminLogin: '/admin/login',
} as const;

export const authService = {
  adminLogin: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>(AUTH_ENDPOINTS.adminLogin, { email, password }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data;
  },
};
