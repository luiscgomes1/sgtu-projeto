import { z } from 'zod';
import { uuidParam, dateRegex, statusField } from '../../shared/schemas.js';

export const motoristaCreateSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
    cpf: z.string().length(11, 'O CPF deve ter 11 dígitos (apenas números).'),
    data_nascimento: z.string().regex(dateRegex, 'A data de nascimento deve estar no formato YYYY-MM-DD'),
    telefone: z.string().min(10, 'O telefone deve ter pelo menos 10 dígitos.').max(11, 'O telefone deve ter no máximo 11 dígitos.'),
    cnh: z.string().min(9, 'A CNH deve ter pelo menos 9 dígitos.').max(11, 'A CNH deve ter no máximo 11 dígitos.'),
    validade_cnh: z.string().regex(dateRegex, 'A validade da CNH deve estar no formato YYYY-MM-DD'),
});

export const motoristaUpdateSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres').optional(),
    cpf: z.string().length(11, 'O CPF deve ter 11 dígitos (apenas números).').optional(),
    data_nascimento: z.string().regex(dateRegex, 'A data de nascimento deve estar no formato YYYY-MM-DD').optional(),
    telefone: z.string().min(10, 'O telefone deve ter pelo menos 10 dígitos.').max(11, 'O telefone deve ter no máximo 11 dígitos.').optional(),
    cnh: z.string().min(9, 'A CNH deve ter pelo menos 9 dígitos.').max(11, 'A CNH deve ter no máximo 11 dígitos.').optional(),
    validade_cnh: z.string().regex(dateRegex, 'A validade da CNH deve estar no formato YYYY-MM-DD').optional(),
    status: statusField.optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Pelo menos um campo deve ser fornecido para atualização' });

export const motoristaListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().default(''),
    status: z.enum(['ativo', 'inativo', '']).default(''),
});

export const motoristaIdParamsSchema = z.object({
    id: uuidParam,
});
