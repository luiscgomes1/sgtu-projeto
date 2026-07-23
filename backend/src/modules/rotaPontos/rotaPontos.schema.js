import { z } from 'zod';
import { uuidParam, statusField } from '../../shared/schemas.js';

export const rotaIdParamsSchema = z.object({
    rotaId: uuidParam,
});

export const rotaPontoParamsSchema = z.object({
    rotaId: uuidParam,
    pontoId: uuidParam,
});

export const rotaPontosOrdemSchema = z.object({
    ordens: z.array(
        z.object({
            id: uuidParam,
            ordem: z.number().int().min(1, 'O campo ordem deve ser no mínimo 1.'),
        })
    ).min(1, 'A lista de ordens não pode estar vazia.'),
});

export const pontoStatusSchema = z.object({
    status: statusField,
});
