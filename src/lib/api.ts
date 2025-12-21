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
  channelLogsPurchases?: string;
  channelLogsDeliveries?: string;
  categoryCarts?: string;
  categoryApproved?: string;
  categoryTickets?: string;
  roleClient?: string;
  roleAdmin?: string;
  storeName?: string;
  storeColor?: string;
  pricePerK: number;
  paymentTimeoutMinutes: number;
  cartInactivityMinutes: number;
  robloxApiKey?: string;
  robloxGameId?: string;
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

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !endpoint.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Não autorizado');
    }

    if (!response.ok) {
      const error = await response.text();
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
}

export const api = new ApiClient();
export type { LoginResponse, Game, Product, BotConfig, AdminUser, Stats };
