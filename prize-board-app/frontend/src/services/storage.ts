const TOKEN_KEY = 'swipe2win_token';
const ROLE_KEY = 'swipe2win_role';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getRole: () => localStorage.getItem(ROLE_KEY),
  setRole: (role: string) => localStorage.setItem(ROLE_KEY, role),
  clearRole: () => localStorage.removeItem(ROLE_KEY),
};
