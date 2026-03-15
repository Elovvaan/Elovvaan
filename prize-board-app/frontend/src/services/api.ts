import axios from 'axios';
import { storage } from './storage';

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');
const normalizePath = (value: string) => value.trim();
const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const rawApiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_BASE_URL = "/api";

export const buildApiUrl = (path: string) => {
  const normalizedPath = normalizePath(path);
  if (isAbsoluteUrl(normalizedPath)) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
