import { z } from 'zod';

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'Código deve ter no mínimo 3 caracteres')
    .max(20, 'Código muito longo')
    .regex(/^[A-Z0-9_-]+$/, 'Código deve conter apenas letras maiúsculas, números, - e _')
    .toUpperCase()
    .trim(),
  discountType: z.enum(['percentage', 'fixed'], { message: 'Tipo de desconto inválido' }),
  discountValue: z
    .number()
    .positive('Valor do desconto deve ser positivo'),
  expiresAt: z
    .string()
    .datetime('Data de expiração inválida')
    .optional()
    .or(z.literal('')),
  maxUses: z
    .number()
    .int('Máximo de usos deve ser um número inteiro')
    .positive('Máximo de usos deve ser positivo')
    .optional()
    .or(z.literal(null)),
  active: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;
