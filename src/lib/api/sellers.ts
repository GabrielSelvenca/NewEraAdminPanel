import { client } from './client';
import type { Seller, UpdateSellerRequest } from './types';

export const sellers = {
  async getAll(): Promise<Seller[]> {
    return client.request<Seller[]>('/api/sellers');
  },

  async getById(id: number): Promise<Seller> {
    return client.request<Seller>(`/api/sellers/${id}`);
  },

  async update(id: number, data: Partial<UpdateSellerRequest>): Promise<Seller> {
    return client.request<Seller>(`/api/sellers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
