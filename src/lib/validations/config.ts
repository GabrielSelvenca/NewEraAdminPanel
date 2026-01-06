import { z } from 'zod';

export const botConfigSchema = z.object({
  storeName: z
    .string()
    .min(2, 'Nome da loja deve ter no mínimo 2 caracteres')
    .max(50, 'Nome muito longo')
    .trim()
    .optional()
    .or(z.literal('')),
  storeColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (formato: #RRGGBB)')
    .optional()
    .or(z.literal('')),
  pricePerKRobux: z
    .number()
    .min(0.01, 'Preço por K (Robux) deve ser maior que 0')
    .max(1000, 'Preço muito alto'),
  pricePerKGamepass: z
    .number()
    .min(0.01, 'Preço por K (Gamepass) deve ser maior que 0')
    .max(1000, 'Preço muito alto'),
  paymentTimeoutMinutes: z
    .number()
    .int('Timeout deve ser um número inteiro')
    .min(5, 'Timeout mínimo de 5 minutos')
    .max(60, 'Timeout máximo de 60 minutos'),
  cartInactivityMinutes: z
    .number()
    .int('Inatividade deve ser um número inteiro')
    .min(1, 'Inatividade mínima de 1 minuto')
    .max(30, 'Inatividade máxima de 30 minutos'),
  embedGamepassMessage: z
    .string()
    .max(2000, 'Mensagem muito longa')
    .optional()
    .or(z.literal('')),
  embedRobuxMessage: z
    .string()
    .max(2000, 'Mensagem muito longa')
    .optional()
    .or(z.literal('')),
  bannerGamepass: z
    .string()
    .url('URL do banner inválida')
    .optional()
    .or(z.literal('')),
  bannerRobux: z
    .string()
    .url('URL do banner inválida')
    .optional()
    .or(z.literal('')),
  gamepassEnabled: z.boolean().default(true),
  robuxEnabled: z.boolean().default(true),
});

export type BotConfigInput = z.infer<typeof botConfigSchema>;
