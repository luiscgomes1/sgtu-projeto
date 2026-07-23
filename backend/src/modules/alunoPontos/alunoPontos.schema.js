import { z } from 'zod';
import { uuidParam } from '../../shared/schemas.js';

export const alunoPontoBodySchema = z.object({
    alunoId: uuidParam,
    pontoId: uuidParam,
});

export const alunoIdParamSchema = z.object({
    alunoId: uuidParam,
});

export const pontoIdParamSchema = z.object({
    pontoId: uuidParam,
});
