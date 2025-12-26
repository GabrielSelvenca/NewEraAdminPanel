import { toast as sonnerToast } from 'sonner';

/**
 * Toast wrapper com mensagens padronizadas e tipadas
 */
export const toast = {
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, { description });
  },

  error: (message: string, description?: string) => {
    return sonnerToast.error(message, { description });
  },

  info: (message: string, description?: string) => {
    return sonnerToast.info(message, { description });
  },

  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, { description });
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },
};

/**
 * Mensagens de toast pré-configuradas para ações comuns
 */
export const ToastMessages = {
  // Sucesso
  createSuccess: (resource: string) => `${resource} criado com sucesso`,
  updateSuccess: (resource: string) => `${resource} atualizado com sucesso`,
  deleteSuccess: (resource: string) => `${resource} deletado com sucesso`,
  saveSuccess: 'Alterações salvas com sucesso',
  uploadSuccess: 'Upload realizado com sucesso',
  
  // Erros
  createError: (resource: string) => `Erro ao criar ${resource}`,
  updateError: (resource: string) => `Erro ao atualizar ${resource}`,
  deleteError: (resource: string) => `Erro ao deletar ${resource}`,
  saveError: 'Erro ao salvar alterações',
  uploadError: 'Erro ao fazer upload',
  networkError: 'Erro de conexão. Verifique sua internet.',
  unauthorized: 'Você não tem permissão para esta ação',
  validationError: 'Dados inválidos. Verifique os campos.',
  
  // Loading
  creating: (resource: string) => `Criando ${resource}...`,
  updating: (resource: string) => `Atualizando ${resource}...`,
  deleting: (resource: string) => `Deletando ${resource}...`,
  saving: 'Salvando alterações...',
  uploading: 'Fazendo upload...',
  loading: 'Carregando...',
} as const;
