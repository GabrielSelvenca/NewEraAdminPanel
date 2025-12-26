import { client } from './client';
import type { MercadoPagoPayment } from './types';

export const mercadopago = {
  async createPixPayment(amount: number, description: string): Promise<MercadoPagoPayment> {
    return client.request<MercadoPagoPayment>('/api/mercadopago/payments/pix', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  },

  async getPayment(paymentId: string): Promise<MercadoPagoPayment> {
    return client.request<MercadoPagoPayment>(`/api/mercadopago/payments/${paymentId}`);
  },

  async getPaymentStatus(paymentId: string): Promise<{ status: string; statusDetail?: string }> {
    return client.request(`/api/mercadopago/payments/${paymentId}/status`);
  },
};
