import axios from 'axios';
import { api } from './api';
import type { User } from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

interface BackendAuthResponse {
  accessToken: string;
}

interface SignupResult extends AuthResponse {
  requestUrl: string;
}

const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/me',
  adminLogin: '/admin/login',
} as const;

const mapAuthResponse = async (path: string, payload: Record<string, unknown>) => {
  const { data } = await api.post<BackendAuthResponse>(path, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const token = data.accessToken;
  const { data: user } = await api.get<User>(AUTH_ENDPOINTS.me, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return { token, user };
};

export const authService = {
  login: async (email: string, password: string) => {
    return mapAuthResponse(AUTH_ENDPOINTS.login, { email, password });
  },
  signup: async (_name: string, email: string, password: string): Promise<SignupResult> => {
    const payload = { email, password };

    console.info('[signup] sending request', { path: AUTH_ENDPOINTS.register, payload });

    try {
      const result = await mapAuthResponse(AUTH_ENDPOINTS.register, payload);
      console.info('[signup] received response', { path: AUTH_ENDPOINTS.register });
      return { ...result, requestUrl: AUTH_ENDPOINTS.register };
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      console.error('[signup] request failed', { path: AUTH_ENDPOINTS.register, status, error });
      throw error;
    }
  },
  adminLogin: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>(AUTH_ENDPOINTS.adminLogin, { email, password }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data;
  },
};
