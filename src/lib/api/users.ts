import { client } from './client';
import type { AdminUser } from './types';

export const users = {
  async getAll(): Promise<AdminUser[]> {
    return client.request<AdminUser[]>('/api/admin/users');
  },

  async create(user: { username: string; name: string; password: string; role: string }): Promise<AdminUser> {
    return client.request<AdminUser>('/api/admin/register', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async update(id: number, data: { 
    name?: string; 
    username?: string; 
    role?: string; 
    active?: boolean;
    phone?: string;
    cpfCnpj?: string;
    mercadoPagoAccessToken?: string;
    mercadoPagoSandbox?: boolean;
  }): Promise<AdminUser> {
    return client.request<AdminUser>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    return client.request<void>(`/api/admin/users/${id}`, { method: 'DELETE' });
  },

  async changePassword(id: number, data: { currentPassword?: string; newPassword: string }): Promise<void> {
    return client.request<void>(`/api/admin/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAllowedRoles(): Promise<string[]> {
    return client.request<string[]>('/api/admin/allowed-roles');
  },
};
