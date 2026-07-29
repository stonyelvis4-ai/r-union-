import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, removeToken } from '@/services/api';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  setToken: (t: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken().then((t) => {
      setTokenState(t);
      setIsLoading(false);
    });
  }, []);

  const setToken = (t: string | null) => {
    setTokenState(t);
  };

  const logout = async () => {
    await removeToken();
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
