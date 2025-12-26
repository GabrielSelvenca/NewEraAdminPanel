import { z } from 'zod';

const pixKeyRegex = /^([0-9]{11}|[0-9]{14}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

export const partnerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  pixKey: z
    .string()
    .min(1, 'Chave PIX é obrigatória')
    .regex(pixKeyRegex, 'Chave PIX inválida (CPF, CNPJ, email, telefone ou chave aleatória)')
    .trim(),
  percentage: z
    .number()
    .min(0, 'Porcentagem não pode ser negativa')
    .max(100, 'Porcentagem não pode ser maior que 100')
    .int('Porcentagem deve ser um número inteiro'),
  active: z.boolean().default(true),
});

export type PartnerInput = z.infer<typeof partnerSchema>;
