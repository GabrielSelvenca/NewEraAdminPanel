import { client } from './client';
import type { AsaasSubaccount, CreateSubaccountRequest, AsaasAccountInfo, AsaasCustomer } from './types';

export const asaas = {
  async getSubaccounts(): Promise<AsaasSubaccount[]> {
    return client.request<AsaasSubaccount[]>('/api/asaas/subaccounts');
  },

  async createSubaccount(data: CreateSubaccountRequest): Promise<AsaasSubaccount> {
    return client.request<AsaasSubaccount>('/api/asaas/subaccounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getBalance(): Promise<{ balance: number }> {
    return client.request<{ balance: number }>('/api/asaas/balance');
  },

  async getAccount(): Promise<AsaasAccountInfo | null> {
    try {
      return await client.request<AsaasAccountInfo>('/api/asaas/account');
    } catch {
      return null;
    }
  },

  async getCustomers(): Promise<{ data: AsaasCustomer[] }> {
    return client.request<{ data: AsaasCustomer[] }>('/api/asaas/customers');
  },

  async createCustomer(data: { name: string; cpfCnpj: string; email?: string }): Promise<AsaasCustomer> {
    return client.request<AsaasCustomer>('/api/asaas/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
