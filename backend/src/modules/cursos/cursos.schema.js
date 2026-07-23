import { z } from 'zod';
import { uuidParam, statusField } from '../../shared/schemas.js';

export const cursoCreateSchema = z.object({
    nome: z.string().min(3, 'O nome do curso deve ter pelo menos 3 caracteres').max(100, 'O nome do curso deve ter no máximo 100 caracteres'),
    faculdade_id: uuidParam,
});

export const cursoUpdateSchema = z.object({
    nome: z.string().min(3, 'O nome do curso deve ter pelo menos 3 caracteres').max(100, 'O nome do curso deve ter no máximo 100 caracteres').optional(),
    faculdade_id: uuidParam.optional(),
    status: statusField.optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Pelo menos um campo deve ser fornecido para atualização' });

export const cursoListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().default(''),
    status: z.enum(['ativo', 'inativo', '']).default(''),
    faculdade_id: z.union([uuidParam, z.literal('')]).default(''),
});

export const cursoIdParamSchema = z.object({
    id: uuidParam,
});

export const faculdadeIdParamSchema = z.object({
    faculdadeId: uuidParam,
});
