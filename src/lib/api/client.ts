const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://neweraapi.squareweb.app';

export class ApiClient {
  private maxRetries = 3;
  private retryDelay = 1000;

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
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
}

export const client = new ApiClient();
