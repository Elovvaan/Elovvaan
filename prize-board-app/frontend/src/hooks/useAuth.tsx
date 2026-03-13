import { createContext, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { storage } from '../services/storage';
import type { Role, User } from '../types';

interface AuthContextValue {
  user: User | null;
  role: Role;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(storage.getUser());

  const saveSession = (nextUser: User, token: string) => {
    storage.setToken(token);
    storage.setUser(nextUser);
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    saveSession(result.user, result.token);
  };

  const signup = async (name: string, email: string, password: string) => {
    const result = await authService.signup(name, email, password);
    saveSession(result.user, result.token);
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
