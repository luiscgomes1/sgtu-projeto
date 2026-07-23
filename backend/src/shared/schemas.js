import { z } from 'zod';

export const uuidParam = z.string().uuid('O ID fornecido não é um UUID válido');

export const statusField = z.enum(['ativo', 'inativo']);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().default(''),
  status: z.enum(['ativo', 'inativo', '']).default(''),
});

export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const timeRegex = /^(?:2[0-3]|[0-1]?[0-9]):[0-5][0-9]$/;
export const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]|;:'",.<>?/`~]).{8,}$/;

export const TIPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const nomeField = z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres');

export const emailField = z.string().email('O e-mail deve ser válido.');

export const cpfField = z.string().length(11, 'O CPF deve ter exatamente 11 caracteres');

export const telefoneField = z.string().max(15);

export const senhaField = z.string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(senhaRegex, 'A senha deve conter maiúscula, minúscula, número e caractere especial');
