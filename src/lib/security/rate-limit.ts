/**
 * Client-side rate limiting para prevenir spam e abuse
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly cleanupInterval = 60000; // 1 minuto

  constructor() {
    // Limpar entradas expiradas periodicamente
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), this.cleanupInterval);
    }
  }

  /**
   * Verifica se a ação pode ser executada
   * @param key - Identificador único da ação
   * @param maxRequests - Máximo de requisições permitidas
   * @param windowMs - Janela de tempo em ms
   */
  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now >= entry.resetAt) {
      // Primeira requisição ou janela expirada
      this.limits.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      // Limite excedido
      return false;
    }

    // Incrementar contador
    entry.count++;
    return true;
  }

  /**
   * Reseta o contador para uma chave específica
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Limpa entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.limits.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.limits.delete(key));
  }

  /**
   * Retorna o tempo restante até o reset (em ms)
   */
  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;

    const remaining = entry.resetAt - Date.now();
    return Math.max(0, remaining);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Preset para ações comuns
 */
export const RateLimits = {
  // Login: 5 tentativas por 15 minutos
  LOGIN: { key: 'login', maxRequests: 5, windowMs: 15 * 60 * 1000 },
  
  // Criar recursos: 10 por minuto
  CREATE: { key: 'create', maxRequests: 10, windowMs: 60 * 1000 },
  
  // Atualizar recursos: 20 por minuto
  UPDATE: { key: 'update', maxRequests: 20, windowMs: 60 * 1000 },
  
  // Deletar recursos: 5 por minuto
  DELETE: { key: 'delete', maxRequests: 5, windowMs: 60 * 1000 },
  
  // Upload de imagens: 3 por minuto
  UPLOAD: { key: 'upload', maxRequests: 3, windowMs: 60 * 1000 },
  
  // API calls gerais: 60 por minuto
  API_CALL: { key: 'api-call', maxRequests: 60, windowMs: 60 * 1000 },
} as const;

/**
 * Helper para verificar rate limit com erro descritivo
 */
export function checkRateLimit(
  action: keyof typeof RateLimits,
  customKey?: string
): void {
  const limit = RateLimits[action];
  const key = customKey ? `${limit.key}:${customKey}` : limit.key;
  
  if (!rateLimiter.check(key, limit.maxRequests, limit.windowMs)) {
    const timeUntilReset = rateLimiter.getTimeUntilReset(key);
    const seconds = Math.ceil(timeUntilReset / 1000);
    
    throw new Error(
      `Limite de requisições excedido. Aguarde ${seconds} segundos antes de tentar novamente.`
    );
  }
}
