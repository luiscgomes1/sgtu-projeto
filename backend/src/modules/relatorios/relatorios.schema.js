import { z } from 'zod';
import { uuidParam } from '../../shared/schemas.js';

export const rotaIdParamsSchema = z.object({
    rotaId: uuidParam,
});

export const alunoIdParamsSchema = z.object({
    alunoId: uuidParam,
});

export const motoristaIdParamsSchema = z.object({
    motoristaId: uuidParam,
});

export const faculdadeIdParamsSchema = z.object({
    faculdadeId: uuidParam,
});

export const cursoIdParamsSchema = z.object({
    cursoId: uuidParam,
});
