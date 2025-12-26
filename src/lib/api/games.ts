import { client } from './client';
import type { Game } from './types';

export const games = {
  async getAll(): Promise<Game[]> {
    return client.request<Game[]>('/api/games');
  },

  async getById(id: number): Promise<Game> {
    return client.request<Game>(`/api/games/${id}`);
  },

  async create(game: Partial<Game>): Promise<Game> {
    return client.request<Game>('/api/games', {
      method: 'POST',
      body: JSON.stringify(game),
    });
  },

  async update(id: number, game: Partial<Game>): Promise<Game> {
    return client.request<Game>(`/api/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(game),
    });
  },

  async delete(id: number): Promise<void> {
    return client.request<void>(`/api/games/${id}`, { method: 'DELETE' });
  },
};
