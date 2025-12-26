"use client";

import { useState, useCallback, useEffect } from 'react';
import { sales } from '@/lib/api';
import type { Stats, SalesStats } from '@/lib/api';

export function useGeneralStats() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sales.getGeneralStats();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats: data,
    loading,
    error,
    refresh: loadStats,
  };
}

export function useSalesStats(days: number = 7) {
  const [data, setData] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sales.getStats(days);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas de vendas');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats: data,
    loading,
    error,
    refresh: loadStats,
  };
}
