import { client } from './client';
import type { Product } from './types';

export const products = {
  async getByGameId(gameId: number): Promise<Product[]> {
    return client.request<Product[]>(`/api/products/game/${gameId}`);
  },

  async create(product: Partial<Product>): Promise<Product> {
    return client.request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async update(id: number, product: Partial<Product>): Promise<Product> {
    return client.request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async delete(id: number): Promise<void> {
    return client.request<void>(`/api/products/${id}`, { method: 'DELETE' });
  },

  async refreshImage(productId: number): Promise<{ imageUrl: string }> {
    return client.request<{ imageUrl: string }>(`/api/roblox/refresh-product-image/${productId}`, {
      method: 'POST',
    });
  },
};
