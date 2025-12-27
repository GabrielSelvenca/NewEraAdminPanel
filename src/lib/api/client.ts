const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://neweraapi.squareweb.app';

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiClient {
  private maxRetries = 3;
  private retryDelay = 1000;

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

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
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('api-online'));
        }

        if (response.status === 204) {
          return {} as T;
        }

        return response.json();

      } catch (error: unknown) {
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('api-offline'));
    }
    throw lastError || new Error('Falha ao conectar com a API após múltiplas tentativas');
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

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, { method: 'GET' });
    return { data };
  }

  async post<T>(endpoint: string, body?: unknown): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  }

  async delete<T>(endpoint: string): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, { method: 'DELETE' });
    return { data };
  }

  async put<T>(endpoint: string, body?: unknown): Promise<{ data: T }> {
    const data = await this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  }
}

export const client = new ApiClient();
