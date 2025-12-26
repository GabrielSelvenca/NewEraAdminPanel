import { z } from 'zod';

export const gameSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  robloxGameId: z
    .string()
    .regex(/^\d+$/, 'ID do jogo deve conter apenas números')
    .optional()
    .or(z.literal('')),
  robloxPlaceId: z
    .string()
    .regex(/^\d+$/, 'ID do place deve conter apenas números')
    .optional()
    .or(z.literal('')),
  imageUrl: z
    .string()
    .url('URL da imagem inválida')
    .optional()
    .or(z.literal('')),
  bannerUrl: z
    .string()
    .url('URL do banner inválida')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),
  creator: z
    .string()
    .max(100, 'Nome do criador muito longo')
    .optional()
    .or(z.literal('')),
  active: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),
  type: z.number().int().min(0).max(10),
  delivery: z.number().int().min(0).max(10),
  price: z
    .number()
    .min(0, 'Preço não pode ser negativo')
    .max(1000000, 'Preço muito alto')
    .optional(),
  robuxAmount: z
    .number()
    .int('Quantidade de Robux deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa')
    .max(1000000000, 'Quantidade muito alta'),
  robloxGamepassId: z
    .string()
    .regex(/^\d+$/, 'ID do gamepass deve conter apenas números')
    .optional()
    .or(z.literal('')),
  imageUrl: z
    .string()
    .url('URL da imagem inválida')
    .optional()
    .or(z.literal('')),
  active: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
  gameId: z.number().int().positive('ID do jogo inválido'),
});

export type GameInput = z.infer<typeof gameSchema>;
export type ProductInput = z.infer<typeof productSchema>;
