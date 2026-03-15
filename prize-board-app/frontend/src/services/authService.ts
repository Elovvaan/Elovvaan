import axios from 'axios';
import { API_BASE_URL, api, buildApiUrl } from './api';
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

const mapAuthResponse = async (path: string, payload: Record<string, unknown>) => {
  const { data } = await api.post<BackendAuthResponse>(path, payload);
  const token = data.accessToken;
  const { data: user } = await api.get<User>('/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return { token, user };
};

export const authService = {
  login: async (email: string, password: string) => {
    return mapAuthResponse('/auth/login', { email, password });
  },
  signup: async (_name: string, email: string, password: string): Promise<SignupResult> => {
    const signupUrl = `${API_BASE_URL}/auth/register`;
    const payload = { email, password };

    console.info('[signup] sending request', { url: signupUrl, payload });

    try {
      const result = await mapAuthResponse(signupUrl, payload);
      console.info('[signup] received response', { url: signupUrl });
      return { ...result, requestUrl: signupUrl };
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
