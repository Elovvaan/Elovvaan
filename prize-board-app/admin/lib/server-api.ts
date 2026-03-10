import { cookies } from 'next/headers';
import { API_BASE_URL } from './config';

export async function apiRequest(path: string, init?: RequestInit) {
  const token = cookies().get('admin_token')?.value;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  return response;
}
