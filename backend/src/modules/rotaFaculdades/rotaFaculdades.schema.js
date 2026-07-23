import { z } from 'zod';
import { uuidParam } from '../../shared/schemas.js';

export const rotaIdParamsSchema = z.object({
    rotaId: uuidParam,
});

export const rotaFaculdadeBodySchema = z.object({
    rotaId: uuidParam,
    faculdadeId: uuidParam,
});
