"use client";

import { useState, useCallback, useEffect } from 'react';
import { deliveries } from '@/lib/api';
import type { Delivery, DeliveryStats } from '@/lib/api';

export function useDeliveries(status?: string) {
  const [data, setData] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await deliveries.getAll(status);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar entregas');
    } finally {
      setLoading(false);
    }
  }, [status]);

  const updateStatus = useCallback(async (id: number, statusData: { status: string; proofUrl?: string; notes?: string; deliveryMethod?: string }) => {
    setError(null);
    try {
      const result = await deliveries.updateStatus(id, statusData);
      setData(prev => prev.map(d => d.id === id ? result : d));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar entrega';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  return {
    deliveries: data,
    loading,
    error,
    refresh: loadDeliveries,
    updateStatus,
  };
}

export function useDeliveryStats() {
  const [data, setData] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await deliveries.getStats();
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
