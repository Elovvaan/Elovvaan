import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { storage } from '../services/storage';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!storage.getToken()) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await authService.profile();
        setUser(currentUser);
      } catch {
        storage.clearToken();
        storage.clearRole();
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: (token: string, nextUser: User) => {
        storage.setToken(token);
        storage.setRole(nextUser.role);
        setUser(nextUser);
      },
      logout: () => {
        storage.clearToken();
        storage.clearRole();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
