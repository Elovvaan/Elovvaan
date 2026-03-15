import { createContext, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { loginUser } from '../services/authApi';
import { storage } from '../services/storage';
import type { Role, User } from '../types';

interface SignupResult {
  requestUrl: string;
}

interface AuthContextValue {
  user: User | null;
  role: Role;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<SignupResult>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const toUser = (value: unknown): User => {
  const payload = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  return {
    id: typeof payload.id === 'string' ? payload.id : '',
    name: typeof payload.name === 'string' ? payload.name : '',
    email: typeof payload.email === 'string' ? payload.email : '',
    xp: typeof payload.xp === 'number' ? payload.xp : 0,
    wins: typeof payload.wins === 'number' ? payload.wins : 0,
    entries: typeof payload.entries === 'number' ? payload.entries : 0,
    role: payload.role === 'admin' ? 'admin' : 'user',
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(storage.getUser());

  const saveSession = (nextUser: User, token: string) => {
    storage.setToken(token);
    storage.setUser(nextUser);
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    const result = await loginUser({ email, password });
    saveSession(toUser(result.user ?? { email, role: 'user' }), result.token);
  };

  const signup = async (_name: string, _email: string, _password: string) => {
    throw new Error('Signup from AuthContext is deprecated. Use registerUser directly on the signup page.');
  };

  const adminLogin = async (email: string, password: string) => {
    const result = await authService.adminLogin(email, password);
    saveSession({ ...result.user, role: 'admin' }, result.token);
  };

  const logout = () => {
    storage.clearToken();
    storage.clearUser();
    setUser(null);
  };

  const role: Role = user?.role ?? 'guest';

  const value = useMemo(() => ({ user, role, login, signup, adminLogin, logout }), [user, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
