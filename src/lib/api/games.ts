import { client } from './client';
import type { Game } from './types';

interface GameStats {
  totalSales: number;
  totalRevenue: number;
  totalRobuxSold: number;
  periodSales: number;
  periodRevenue: number;
  periodRobux: number;
  salesByDay: { date: string; sales: number; revenue: number; robux: number }[];
}

export const games = {
  async getAll(activeOnly?: boolean): Promise<Game[]> {
    const params = activeOnly ? '?activeOnly=true' : '';
    return client.request<Game[]>(`/api/games${params}`);
  },

  async getById(id: number): Promise<Game> {
    return client.request<Game>(`/api/games/${id}`);
  },

  async create(game: Partial<Game>): Promise<{ success: boolean; game: { id: number; name: string } }> {
    return client.request('/api/games', {
      method: 'POST',
      body: JSON.stringify(game),
    });
  },

  async createFromRoblox(placeId: number): Promise<{ success: boolean; game: { id: number; name: string; description?: string; robloxUniverseId?: number; robloxPlaceId?: number; imageUrl?: string } }> {
    return client.request('/api/games/from-roblox', {
      method: 'POST',
      body: JSON.stringify({ placeId }),
    });
  },

  async update(id: number, game: Partial<Game>): Promise<{ success: boolean }> {
    return client.request(`/api/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(game),
    });
  },

  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return client.request(`/api/games/${id}`, { method: 'DELETE' });
  },

  async reorder(items: { id: number; order: number }[]): Promise<{ success: boolean }> {
    return client.request('/api/games/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async getStats(id: number, days?: number): Promise<GameStats> {
    const params = days ? `?days=${days}` : '';
    return client.request(`/api/games/${id}/stats${params}`);
  },

  async getActive(): Promise<{ id: number; name: string; imageUrl?: string; requiresPrivateServer: boolean; itemsCount: number }[]> {
    return client.request('/api/games/active');
  },
};
