import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, AuthResult } from '../services/api';

export type AuthState = {
  token: string | null;
  user: { id: string; username: string } | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    api.me(token).then(setUser).catch(() => setToken(null));
  }, [token]);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  async function doLogin(username: string, password: string) {
    const res = await api.login(username, password);
    setToken(res.token);
    setUser(res.user);
  }

  async function doRegister(username: string, password: string) {
    const res: AuthResult = await api.register(username, password);
    setToken(res.token);
    setUser(res.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthState>(() => ({ token, user, login: doLogin, register: doRegister, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

