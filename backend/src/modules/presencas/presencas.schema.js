import { z } from 'zod';
import { uuidParam } from '../../shared/schemas.js';

export const presencaManualSchema = z.object({
    alunoId: uuidParam,
    rotaId: uuidParam,
});

export const marcarPresencaSchema = z.object({
    token: z.string().min(1, 'O token é obrigatório'),
    alunoId: uuidParam.optional(),
});

export const rotaIdParamsSchema = z.object({
    rotaId: uuidParam,
});

export const alunoIdParamsSchema = z.object({
    alunoId: uuidParam,
});

export const presencaIdParamsSchema = z.object({
    presencaId: uuidParam,
});

export const validarTokenSchema = z.object({
    token: uuidParam,
});
