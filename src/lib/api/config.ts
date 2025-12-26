import { client } from './client';
import type { BotConfig, DiscordServerData } from './types';

export const config = {
  async get(): Promise<BotConfig> {
    return client.request<BotConfig>('/api/config');
  },

  async update(configData: Partial<BotConfig>): Promise<BotConfig> {
    return client.request<BotConfig>('/api/config', {
      method: 'PUT',
      body: JSON.stringify(configData),
    });
  },

  async notifyBotUpdate(): Promise<{ message: string; timestamp: string }> {
    return client.request('/api/bot/notify-update', {
      method: 'POST',
    });
  },

  async processPlaceholders(text: string, gamesList?: { name: string; productCount: number }[]): Promise<string> {
    const response = await client.request<{ processedText: string }>('/api/config/process-placeholders', {
      method: 'POST',
      body: JSON.stringify({ text, gamesList }),
    });
    return response.processedText;
  },

  async getDiscordServerData(): Promise<DiscordServerData | null> {
    const result = await client.request<{ synced: boolean; data?: DiscordServerData }>('/api/discord/server');
    return result.synced ? result.data || null : null;
  },
};
