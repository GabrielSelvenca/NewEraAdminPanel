const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://neweraapi.squareweb.app';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  expiresIn: number;
}

interface Game {
  id: number;
  name: string;
  robloxGameId?: string;
  robloxPlaceId?: string;
  imageUrl?: string;
  bannerUrl?: string;
  description?: string;
  creator?: string;
  active: boolean;
  products?: Product[];
  totalSales?: number;
  totalRevenue?: number;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  type: number;
  delivery: number;
  price?: number;
  robuxAmount: number;
  robloxGamepassId?: string;
  imageUrl?: string;
  active: boolean;
  displayOrder: number;
  gameId: number;
}

interface BotConfig {
  id: number;
  guildId?: string;
  
  // Categorias
  categoryCartsGamepass?: string;
  categoryCartsRobux?: string;
  categoryApproved?: string;
  
  // Canais
  channelPurchasesLog?: string;
  channelDeliveriesLog?: string;
  channelSetupGamepass?: string;
  channelSetupRobux?: string;
  
  // Store Settings
  storeName?: string;
  storeColor?: string;
  pricePerK: number;
  paymentTimeoutMinutes: number;
  cartInactivityMinutes: number;
  
  // Roblox API
  robloxApiKey?: string;
  robloxGameId?: string;
  
  // Mensagens dos Embeds
  embedGamepassMessage?: string;
  embedRobuxMessage?: string;
  
  // Banners
  bannerGamepass?: string;
  bannerRobux?: string;
  
  // IDs mensagens setup
  setupGamepassMessageId?: string;
  setupRobuxMessageId?: string;
  
  // Cargos por valor
  tierRoles?: string;
  
  // Disponibilidade de vendas
  gamepassEnabled?: boolean;
  robuxEnabled?: boolean;
  
  // Dados Discord (JSON)
  discordServerData?: string;
  asaasApiKey?: string;
  asaasWalletId?: string;
}

interface SalesStats {
  period: number;
  totalSales: number;
  totalRevenue: number;
  totalRobux: number;
  averageTicket: number;
  variation: number;
  previousPeriodSales: number;
  previousPeriodRevenue: number;
  salesByDay: { date: string; vendas: number; receita: number }[];
}

interface Sale {
  id: number;
  userId: string;
  amount: number;
  robux: number;
  gamepasses: string;
  systemOrigin: string;
  createdAt: string;
}

interface SalesResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sales: Sale[];
}

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  active: boolean;
  lastLogin?: string;
}

interface Stats {
  totalSales: number;
  totalAmount: number;
  totalRobux: number;
}

interface Partner {
  id: number;
  name: string;
  pixKey: string;
  percentage: number;
  active: boolean;
  totalReceived: number;
  asaasWalletId?: string;
  createdAt: string;
}

interface AsaasSubaccount {
  id: string;
  name: string;
  email: string;
  walletId: string;
  cpfCnpj: string;
}

interface CreateSubaccountRequest {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string;
  address?: string;
  addressNumber?: string;
  province?: string;
  postalCode?: string;
  birthDate?: string;
}

class ApiClient {
  private maxRetries = 3;
  private retryDelay = 1000; // 1 segundo

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let lastError: Error | null = null;

    // Retry com backoff exponencial
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 segundos

        const response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.status === 401) {
          if (typeof window !== 'undefined' && !endpoint.includes('/login')) {
            window.location.href = '/login';
          }
          throw new Error('Não autorizado');
        }

        if (!response.ok) {
          const error = await response.text();
          
          // Se for erro 500 ou 502/503, tenta retry
          if (response.status >= 500 && attempt < this.maxRetries - 1) {
            lastError = new Error(error || `Erro ${response.status}`);
            await this.sleep(this.retryDelay * (attempt + 1));
            continue;
          }
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('api-offline'));
          }
          throw new Error(error || `Erro ${response.status}`);
        }
        
        // API respondeu com sucesso
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('api-online'));
        }

        if (response.status === 204) {
          return {} as T;
        }

        return response.json();

      } catch (error: unknown) {
        // Se foi timeout ou erro de rede, tenta retry
        const err = error as Error;
        if ((err.name === 'AbortError' || err.message?.includes('fetch')) && attempt < this.maxRetries - 1) {
          console.warn(`API request failed (attempt ${attempt + 1}/${this.maxRetries}):`, err.message);
          lastError = err;
          await this.sleep(this.retryDelay * (attempt + 1));
          continue;
        }
        
        throw error;
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('api-offline'));
    }
    throw lastError || new Error('Falha ao conectar com a API após múltiplas tentativas');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    await this.request<void>('/api/admin/logout', { method: 'POST' });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`, { 
        method: 'GET',
        cache: 'no-store'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<{ id: string; email: string; name: string; role: string }> {
    return this.request('/api/admin/me');
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  // Games
  async getGames(): Promise<Game[]> {
    return this.request<Game[]>('/api/games');
  }

  async getGame(id: number): Promise<Game> {
    return this.request<Game>(`/api/games/${id}`);
  }

  async createGame(game: Partial<Game>): Promise<Game> {
    return this.request<Game>('/api/games', {
      method: 'POST',
      body: JSON.stringify(game),
    });
  }

  async updateGame(id: number, game: Partial<Game>): Promise<Game> {
    return this.request<Game>(`/api/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(game),
    });
  }

  async deleteGame(id: number): Promise<void> {
    return this.request<void>(`/api/games/${id}`, { method: 'DELETE' });
  }

  // Products
  async getProducts(gameId: number): Promise<Product[]> {
    return this.request<Product[]>(`/api/products/game/${gameId}`);
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    return this.request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request<void>(`/api/products/${id}`, { method: 'DELETE' });
  }

  async refreshProductImage(productId: number): Promise<{ imageUrl: string }> {
    return this.request<{ imageUrl: string }>(`/api/roblox/refresh-product-image/${productId}`, {
      method: 'POST',
    });
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async getSalesStats(days: number = 7): Promise<SalesStats> {
    return this.request<SalesStats>(`/api/payments/stats/period?days=${days}`);
  }

  async getSales(page: number = 1, limit: number = 20, days?: number): Promise<SalesResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (days) params.append('days', String(days));
    return this.request<SalesResponse>(`/api/payments/sales?${params}`);
  }

  // Config
  async getConfig(): Promise<BotConfig> {
    return this.request<BotConfig>('/api/config');
  }

  async updateConfig(config: Partial<BotConfig>): Promise<BotConfig> {
    return this.request<BotConfig>('/api/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async notifyBotUpdate(): Promise<{ message: string; timestamp: string }> {
    return this.request('/api/bot/notify-update', {
      method: 'POST',
    });
  }

  async processPlaceholders(text: string, gamesList?: { name: string; productCount: number }[]): Promise<string> {
    const response = await this.request<{ processedText: string }>('/api/config/process-placeholders', {
      method: 'POST',
      body: JSON.stringify({ text, gamesList }),
    });
    return response.processedText;
  }

  // Users
  async getUsers(): Promise<AdminUser[]> {
    return this.request<AdminUser[]>('/api/admin/users');
  }

  async createUser(user: { email: string; name: string; password: string; role: string }): Promise<AdminUser> {
    return this.request<AdminUser>('/api/admin/register', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/api/admin/users/${id}`, { method: 'DELETE' });
  }

  async updateUser(id: number, data: { name?: string; email?: string; role?: string; active?: boolean }): Promise<AdminUser> {
    return this.request<AdminUser>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async uploadImage(file: File): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload da imagem');
    }

    return response.json();
  }

  async changePassword(id: number, data: { currentPassword?: string; newPassword: string }): Promise<void> {
    return this.request<void>(`/api/admin/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllowedRoles(): Promise<string[]> {
    return this.request<string[]>('/api/admin/allowed-roles');
  }

  // Stats
  async getStats(): Promise<Stats> {
    return this.request<Stats>('/api/stats');
  }

  // Sync Roblox
  async syncRoblox(placeIdOrUrl: string): Promise<{ success: boolean; message: string; game?: Game }> {
    return this.request('/api/roblox/sync', {
      method: 'POST',
      body: JSON.stringify({ placeIdOrUrl }),
    });
  }

  async importGamepass(gameId: number, gamepassIdOrUrl: string): Promise<Product> {
    return this.request<Product>('/api/roblox/import-gamepass', {
      method: 'POST',
      body: JSON.stringify({ gameId, gamepassIdOrUrl }),
    });
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    return this.request<Partner[]>('/api/partners');
  }

  async getPartner(id: number): Promise<Partner> {
    return this.request<Partner>(`/api/partners/${id}`);
  }

  async updatePartner(id: number, partner: Partial<Partner>): Promise<Partner> {
    return this.request<Partner>(`/api/partners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(partner),
    });
  }

  async createPartner(partner: { name: string; pixKey: string; percentage: number; adminUserId?: number }): Promise<Partner> {
    return this.request<Partner>('/api/partners', {
      method: 'POST',
      body: JSON.stringify(partner),
    });
  }

  async deletePartner(id: number): Promise<void> {
    return this.request<void>(`/api/partners/${id}`, { method: 'DELETE' });
  }

  // Asaas Subaccounts (Split PIX)
  async getAsaasSubaccounts(): Promise<AsaasSubaccount[]> {
    return this.request<AsaasSubaccount[]>('/api/asaas/subaccounts');
  }

  async createAsaasSubaccount(data: CreateSubaccountRequest): Promise<AsaasSubaccount> {
    return this.request<AsaasSubaccount>('/api/asaas/subaccounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAsaasBalance(): Promise<{ balance: number }> {
    return this.request<{ balance: number }>('/api/asaas/balance');
  }

  async getAsaasAccount(): Promise<AsaasAccountInfo | null> {
    try {
      return await this.request<AsaasAccountInfo>('/api/asaas/account');
    } catch {
      return null;
    }
  }

  // Discord Server Data
  async getDiscordServerData(): Promise<DiscordServerData | null> {
    const result = await this.request<{ synced: boolean; data?: DiscordServerData }>('/api/discord/server');
    return result.synced ? result.data || null : null;
  }

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    return this.request<Coupon[]>('/api/coupons');
  }

  async getCoupon(id: number): Promise<Coupon> {
    return this.request<Coupon>(`/api/coupons/${id}`);
  }

  async createCoupon(data: { code: string; discountType: string; discountValue: number; expiresAt?: string | null; maxUses?: number | null }): Promise<Coupon> {
    return this.request<Coupon>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCoupon(id: number, data: { active?: boolean; expiresAt?: string; maxUses?: number }): Promise<Coupon> {
    return this.request<Coupon>(`/api/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCoupon(id: number): Promise<void> {
    return this.request<void>(`/api/coupons/${id}`, { method: 'DELETE' });
  }

  async validateCoupon(code: string): Promise<{ isValid: boolean; errorMessage?: string; coupon?: Coupon }> {
    return this.request('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Asaas Customers
  async getAsaasCustomers(): Promise<{ data: AsaasCustomer[] }> {
    return this.request<{ data: AsaasCustomer[] }>('/api/asaas/customers');
  }

  async createAsaasCustomer(data: { name: string; cpfCnpj: string; email?: string }): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>('/api/asaas/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Deliveries
  async getDeliveries(status?: string): Promise<Delivery[]> {
    const url = status ? `/api/deliveries?status=${status}` : '/api/deliveries';
    return this.request<Delivery[]>(url);
  }

  async getDelivery(id: number): Promise<Delivery> {
    return this.request<Delivery>(`/api/deliveries/${id}`);
  }

  async getDeliveryStats(): Promise<DeliveryStats> {
    return this.request<DeliveryStats>('/api/deliveries/stats');
  }

  async updateDeliveryStatus(id: number, data: { status: string; proofUrl?: string; notes?: string; deliveryMethod?: string }): Promise<Delivery> {
    return this.request<Delivery>(`/api/deliveries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadDeliveryProof(id: number, proofUrl: string): Promise<{ message: string; delivery: Delivery }> {
    return this.request(`/api/deliveries/${id}/proof`, {
      method: 'PUT',
      body: JSON.stringify({ proofUrl }),
    });
  }

  // Sellers
  async getSellers(): Promise<Seller[]> {
    return this.request<Seller[]>('/api/sellers');
  }

  async getSeller(id: number): Promise<Seller> {
    return this.request<Seller>(`/api/sellers/${id}`);
  }

  async updateSeller(id: number, data: Partial<UpdateSellerRequest>): Promise<Seller> {
    return this.request<Seller>(`/api/sellers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

interface DiscordServerData {
  guildId: string;
  guildName: string;
  guildIcon?: string;
  memberCount: number;
  categories: { id: string; name: string }[];
  textChannels: { id: string; name: string; parentId?: string }[];
  roles: { id: string; name: string; color: string; position: number }[];
  syncedAt: string;
}

interface AsaasAccountInfo {
  name?: string;
  tradingName?: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  personType?: string;
  city?: string;
  state?: string;
}

interface Coupon {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  active: boolean;
  isValid: boolean;
  isExpired: boolean;
  isMaxUsesReached: boolean;
  createdAt: string;
  createdBy?: number;
}

interface Delivery {
  id: number;
  saleId: number;
  userId: string;
  robloxUsername: string;
  robloxUserId?: number;
  type: string;
  robuxAmount?: number;
  gamepassIds?: string;
  value: number;
  status: string;
  proofUrl?: string;
  deliveryMethod?: string;
  deliveredBy?: number;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  sale?: {
    id: number;
    amount: number;
    status: string;
    paymentId?: string;
  };
}

interface DeliveryStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  totalValue: number;
  avgDeliveryTimeMinutes: number;
}

interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email?: string;
  dateCreated: string;
}

interface Seller {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
  status: string;
  hasAsaasApiKey: boolean;
  asaasSandbox: boolean;
  asaasWalletId?: string;
  asaasAccountId?: string;
  maxActiveOrders: number;
  cooldownSeconds: number;
  assignedVolume24h: number;
  assignedCount24h: number;
  activeOrders: number;
  lastAssignedAt?: string;
  cooldownUntil?: string;
  totalOrdersCompleted: number;
  totalVolumeCompleted: number;
  robuxBalance: number;
  robuxVerifiedAt?: string;
  robloxUserId?: number;
  robloxUsername?: string;
  lowStockAlertSent: boolean;
  createdAt: string;
}

interface UpdateSellerRequest {
  name?: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  status?: string;
  asaasApiKey?: string;
  asaasSandbox?: boolean;
  asaasWalletId?: string;
  asaasAccountId?: string;
  maxActiveOrders?: number;
  cooldownSeconds?: number;
}

export const api = new ApiClient();
export type { LoginResponse, Game, Product, BotConfig, AdminUser, Stats, Partner, AsaasSubaccount, CreateSubaccountRequest, AsaasAccountInfo, Coupon, Delivery, DeliveryStats, AsaasCustomer, Seller, UpdateSellerRequest };
