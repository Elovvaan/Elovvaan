import axios from 'axios';
import { api, buildApiUrl } from './api';
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
    const signupPath = '/api/auth/register';
    const signupUrl = buildApiUrl(signupPath);

    console.info('[signup] sending request', { url: signupUrl });

    try {
      const response = await api.post<AuthResponse>(signupPath, { name, email, password });
      console.info('[signup] received response', { url: signupUrl, status: response.status });
      return response.data;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      console.error('[signup] request failed', { url: signupUrl, status, error });
      throw error;
    }
  },
  adminLogin: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/admin/login', { email, password });
    return data;
  },
};
