import { toast } from './toast';
import { ZodError } from 'zod';

/**
 * Classe de erro customizada para erros da aplicação
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Extrai mensagem de erro amigável de diferentes tipos de erro
 */
export function extractErrorMessage(error: unknown): string {
  // Erro customizado
  if (error instanceof AppError) {
    return error.message;
  }

  // Erro de validação Zod
  if (error instanceof ZodError) {
    const firstError = error.issues[0];
    return firstError?.message || 'Dados inválidos';
  }

  // Erro padrão
  if (error instanceof Error) {
    return error.message;
  }

  // String
  if (typeof error === 'string') {
    return error;
  }

  // Objeto com mensagem
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Erro desconhecido';
}

/**
 * Handler centralizado de erros com toast
 */
export function handleError(error: unknown, customMessage?: string): void {
  const message = customMessage || extractErrorMessage(error);
  
  console.error('Error caught:', error);
  
  toast.error('Erro', message);
}

/**
 * Wrapper para funções assíncronas com error handling automático
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showLoading?: boolean;
    loadingMessage?: string;
  }
): Promise<T | null> {
  try {
    let toastId: string | number | undefined;
    
    if (options?.showLoading && options.loadingMessage) {
      toastId = toast.loading(options.loadingMessage);
    }

    const result = await fn();

    if (toastId) {
      sonnerToast.dismiss(toastId);
    }

    if (options?.successMessage) {
      toast.success('Sucesso', options.successMessage);
    }

    return result;
  } catch (error) {
    handleError(error, options?.errorMessage);
    return null;
  }
}

/**
 * Retry logic com backoff exponencial
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries - 1 || !shouldRetry(error)) {
        throw error;
      }

      // Backoff exponencial
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Helper para validar dados com Zod e mostrar erro amigável
 */
export function validateWithToast<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      toast.error('Validação', firstError?.message || 'Dados inválidos');
    } else {
      handleError(error);
    }
    return null;
  }
}

// Import sonner para dismiss
import { toast as sonnerToast } from 'sonner';
