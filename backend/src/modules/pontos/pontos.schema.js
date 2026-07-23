import { z } from 'zod';
import { uuidParam, statusField } from '../../shared/schemas.js';

export const pontoCreateSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
  endereco: z.string().min(3, 'O endereço deve ter pelo menos 3 caracteres').max(100, 'O endereço deve ter no máximo 100 caracteres'),
});

export const pontoUpdateSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres').optional(),
  endereco: z.string().min(3, 'O endereço deve ter pelo menos 3 caracteres').max(100, 'O endereço deve ter no máximo 100 caracteres').optional(),
  status: statusField.optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Pelo menos um campo deve ser fornecido para atualização' });

export const pontoListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().default(''),
    status: z.enum(['ativo', 'inativo', '']).default(''),
});

export const pontoIdParamsSchema = z.object({
    id: uuidParam,
});

export const pontoStatusSchema = z.object({
    status: statusField,
});
