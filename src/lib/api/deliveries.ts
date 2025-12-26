import { client } from './client';
import type { Delivery, DeliveryStats } from './types';

export const deliveries = {
  async getAll(status?: string): Promise<Delivery[]> {
    const url = status ? `/api/deliveries?status=${status}` : '/api/deliveries';
    return client.request<Delivery[]>(url);
  },

  async getById(id: number): Promise<Delivery> {
    return client.request<Delivery>(`/api/deliveries/${id}`);
  },

  async getStats(): Promise<DeliveryStats> {
    return client.request<DeliveryStats>('/api/deliveries/stats');
  },

  async updateStatus(id: number, data: { status: string; proofUrl?: string; notes?: string; deliveryMethod?: string }): Promise<Delivery> {
    return client.request<Delivery>(`/api/deliveries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async uploadProof(id: number, proofUrl: string): Promise<{ message: string; delivery: Delivery }> {
    return client.request(`/api/deliveries/${id}/proof`, {
      method: 'PUT',
      body: JSON.stringify({ proofUrl }),
    });
  },
};
