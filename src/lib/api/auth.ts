import { client, setToken, removeToken } from './client';
import type { LoginResponse } from './types';

export const auth = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await client.request<LoginResponse & { token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  async logout(): Promise<void> {
    try {
      await client.request<void>('/api/admin/logout', { method: 'POST' });
    } finally {
      removeToken();
    }
  },

  async getCurrentUser(): Promise<{ 
    id: string; 
    username: string; 
    name: string; 
    role: string;
    phone?: string;
    cpfCnpj?: string;
    hasMercadoPagoAccessToken?: boolean;
    mercadoPagoSandbox?: boolean;
  }> {
    return client.request('/api/admin/me');
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  },
};
