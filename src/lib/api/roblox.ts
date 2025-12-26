import { client } from './client';
import type { Game, Product } from './types';

export const roblox = {
  async sync(placeIdOrUrl: string): Promise<{ success: boolean; message: string; game?: Game }> {
    return client.request('/api/roblox/sync', {
      method: 'POST',
      body: JSON.stringify({ placeIdOrUrl }),
    });
  },

  async importGamepass(gameId: number, gamepassIdOrUrl: string): Promise<Product> {
    return client.request<Product>('/api/roblox/import-gamepass', {
      method: 'POST',
      body: JSON.stringify({ gameId, gamepassIdOrUrl }),
    });
  },
};
