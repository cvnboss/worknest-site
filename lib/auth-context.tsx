'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Employee } from '@/lib/types';

interface AuthContextType {
  user: Employee | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; department?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (user: Employee) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('worknest_token');
    const savedUser = localStorage.getItem('worknest_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('worknest_token', data.data.token);
        localStorage.setItem('worknest_user', JSON.stringify(data.data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const register = useCallback(async (regData: { email: string; password: string; firstName: string; lastName: string; department?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        localStorage.setItem('worknest_token', data.data.token);
        localStorage.setItem('worknest_user', JSON.stringify(data.data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('worknest_token');
    localStorage.removeItem('worknest_user');
  }, []);

  const updateUser = useCallback((updatedUser: Employee) => {
    setUser(updatedUser);
    localStorage.setItem('worknest_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
