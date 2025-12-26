import { client } from './client';
import type { SalesStats, SalesResponse, Stats } from './types';

export const sales = {
  async getStats(days: number = 7): Promise<SalesStats> {
    return client.request<SalesStats>(`/api/payments/stats/period?days=${days}`);
  },

  async getAll(page: number = 1, limit: number = 20, days?: number): Promise<SalesResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (days) params.append('days', String(days));
    return client.request<SalesResponse>(`/api/payments/sales?${params}`);
  },

  async getGeneralStats(): Promise<Stats> {
    return client.request<Stats>('/api/stats');
  },
};
