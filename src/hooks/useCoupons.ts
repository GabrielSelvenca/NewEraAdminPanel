"use client";

import { useState, useCallback, useEffect } from 'react';
import { coupons } from '@/lib/api';
import type { Coupon } from '@/lib/api';

export function useCoupons() {
  const [data, setData] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await coupons.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cupons');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCoupon = useCallback(async (couponData: { code: string; discountType: string; discountValue: number; expiresAt?: string | null; maxUses?: number | null }) => {
    setError(null);
    try {
      const result = await coupons.create(couponData);
      setData(prev => [...prev, result]);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar cupom';
      setError(message);
      throw err;
    }
  }, []);

  const updateCoupon = useCallback(async (id: number, couponData: { active?: boolean; expiresAt?: string; maxUses?: number }) => {
    setError(null);
    try {
      const result = await coupons.update(id, couponData);
      setData(prev => prev.map(c => c.id === id ? result : c));
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar cupom';
      setError(message);
      throw err;
    }
  }, []);

  const deleteCoupon = useCallback(async (id: number) => {
    setError(null);
    try {
      await coupons.delete(id);
      setData(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar cupom';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  return {
    coupons: data,
    loading,
    error,
    refresh: loadCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  };
}
