"use client";

import { useState, useCallback, useEffect } from 'react';
import { partners } from '@/lib/api';
import type { Partner } from '@/lib/api';

export function usePartners() {
  const [data, setData] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await partners.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPartner = useCallback(async (partnerData: { name: string; pixKey: string; percentage: number; adminUserId?: number }) => {
    setError(null);
    try {
      const result = await partners.create(partnerData);
      setData(prev => [...prev, result]);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar parceiro';
      setError(message);
      throw err;
    }
  }, []);

  const updatePartner = useCallback(async (id: number, partnerData: Partial<Partner>) => {
    setError(null);
    try {
      const result = await partners.update(id, partnerData);
      setData(prev => prev.map(p => p.id === id ? result : p));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar parceiro';
      setError(message);
      throw err;
    }
  }, []);

  const deletePartner = useCallback(async (id: number) => {
    setError(null);
    try {
      await partners.delete(id);
      setData(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar parceiro';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  return {
    partners: data,
    loading,
    error,
    refresh: loadPartners,
    createPartner,
    updatePartner,
    deletePartner,
  };
}
