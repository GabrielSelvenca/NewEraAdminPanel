import { client } from './client';
import type { Coupon } from './types';

export const coupons = {
  async getAll(): Promise<Coupon[]> {
    return client.request<Coupon[]>('/api/coupons');
  },

  async getById(id: number): Promise<Coupon> {
    return client.request<Coupon>(`/api/coupons/${id}`);
  },

  async create(data: { code: string; discountType: string; discountValue: number; expiresAt?: string | null; maxUses?: number | null }): Promise<Coupon> {
    return client.request<Coupon>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: { active?: boolean; expiresAt?: string; maxUses?: number }): Promise<Coupon> {
    return client.request<Coupon>(`/api/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return client.request<void>(`/api/coupons/${id}`, { method: 'DELETE' });
  },

  async validate(code: string): Promise<{ isValid: boolean; errorMessage?: string; coupon?: Coupon }> {
    return client.request('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },
};
