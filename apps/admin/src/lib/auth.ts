'use client';

const TOKEN_KEY = 'swipe2win_admin_token';

export const adminAuth = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
};
