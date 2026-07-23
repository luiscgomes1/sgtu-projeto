import { z } from 'zod';
import { uuidParam, statusField } from '../../shared/schemas.js';

export const rotaCreateSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
});

export const rotaUpdateSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres').optional(),
  status: statusField.optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Nome deve ser fornecido para atualização' });

export const rotaListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().default(''),
    status: z.enum(['ativo', 'inativo', '']).default(''),
});

export const rotaIdParamSchema = z.object({
  id: uuidParam,
});

export const rotaStatusSchema = z.object({
  status: statusField,
});
