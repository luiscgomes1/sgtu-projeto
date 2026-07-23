import { z } from 'zod';
import { uuidParam } from '../../shared/schemas.js';

export const alunoIdParamsSchema = z.object({
    alunoId: uuidParam,
});

export const validarQrCodeSchema = z.object({
    token: uuidParam,
});
