import { z } from 'zod';
import { uuidParam, statusField } from '../../shared/schemas.js';

export const faculdadeCreateSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
  endereco: z.string().min(5, 'O endereço deve ter pelo menos 5 caracteres').max(200, 'O endereço deve ter no máximo 200 caracteres'),
});

export const faculdadeUpdateSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres').optional(),
  endereco: z.string().min(5, 'O endereço deve ter pelo menos 5 caracteres').max(200, 'O endereço deve ter no máximo 200 caracteres').optional(),
  status: statusField.optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Pelo menos um campo deve ser fornecido para atualização' });

export const faculdadeIdParamSchema = z.object({
  id: uuidParam,
});

export const faculdadeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().default(''),
  status: z.enum(['ativo', 'inativo', '']).default(''),
});

export const faculdadeNomeParamsSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
});
