import { client } from './client';
import type { GameItem } from './types';

export const gameItems = {
  async getByGameId(gameId: number, activeOnly?: boolean): Promise<GameItem[]> {
    const params = activeOnly ? '?activeOnly=true' : '';
    return client.request<GameItem[]>(`/api/games/${gameId}/items${params}`);
  },

  async getById(gameId: number, itemId: number): Promise<GameItem> {
    return client.request<GameItem>(`/api/games/${gameId}/items/${itemId}`);
  },

  async create(gameId: number, item: Partial<GameItem>): Promise<{ success: boolean; item: { id: number; name: string; priceRobux: number } }> {
    return client.request(`/api/games/${gameId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async update(gameId: number, itemId: number, item: Partial<GameItem>): Promise<{ success: boolean }> {
    return client.request(`/api/games/${gameId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  async delete(gameId: number, itemId: number): Promise<{ success: boolean; message?: string }> {
    return client.request(`/api/games/${gameId}/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async reorder(gameId: number, items: { id: number; order: number }[]): Promise<{ success: boolean }> {
    return client.request(`/api/games/${gameId}/items/reorder`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async resetStock(gameId: number): Promise<{ success: boolean; itemsReset: number }> {
    return client.request(`/api/games/${gameId}/items/reset-stock`, {
      method: 'POST',
    });
  },

  async getAvailable(gameId: number): Promise<{ game: { id: number; name: string; imageUrl?: string; requiresPrivateServer: boolean; privateServerLink?: string }; items: { id: number; name: string; description?: string; imageUrl?: string; priceRobux: number; priceBrl: number; hasStockLimit: boolean; availableToday?: number }[] }> {
    return client.request(`/api/games/${gameId}/items/available`);
  },
};
