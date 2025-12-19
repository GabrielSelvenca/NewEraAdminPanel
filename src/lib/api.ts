const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://neweraapi.squareweb.app';

interface LoginResponse {
  token: string;
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
  active: boolean;
  products?: Product[];
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
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Não autorizado');
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Erro ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  logout() {
    this.setToken(null);
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
