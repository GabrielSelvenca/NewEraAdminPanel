import { client } from './client';
import type { Partner } from './types';

export const partners = {
  async getAll(): Promise<Partner[]> {
    return client.request<Partner[]>('/api/partners');
  },

  async getById(id: number): Promise<Partner> {
    return client.request<Partner>(`/api/partners/${id}`);
  },

  async create(partner: { name: string; pixKey: string; percentage: number; adminUserId?: number }): Promise<Partner> {
    return client.request<Partner>('/api/partners', {
      method: 'POST',
      body: JSON.stringify(partner),
    });
  },

  async update(id: number, partner: Partial<Partner>): Promise<Partner> {
    return client.request<Partner>(`/api/partners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(partner),
    });
  },

  async delete(id: number): Promise<void> {
    return client.request<void>(`/api/partners/${id}`, { method: 'DELETE' });
  },
};
