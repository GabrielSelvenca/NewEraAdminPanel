import { client } from './client';
import type { LoginResponse } from './types';

export const auth = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return client.request<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<void> {
    await client.request<void>('/api/admin/logout', { method: 'POST' });
  },

  async getCurrentUser(): Promise<{ 
    id: string; 
    email: string; 
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
