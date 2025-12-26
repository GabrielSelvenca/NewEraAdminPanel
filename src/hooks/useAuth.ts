"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await auth.login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await auth.logout();
    } catch {
      // Ignora erro de logout
    } finally {
      setLoading(false);
      router.push('/login');
    }
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
      const user = await auth.getCurrentUser();
      return user;
    } catch {
      router.push('/login');
      return null;
    }
  }, [router]);

  return {
    login,
    logout,
    checkAuth,
    loading,
    error,
  };
}
