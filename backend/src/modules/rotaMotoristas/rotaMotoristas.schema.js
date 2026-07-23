import { z } from 'zod';
import { uuidParam, dateRegex } from '../../shared/schemas.js';

export const rotaIdParamsSchema = z.object({
    rotaId: uuidParam,
});

export const atribuirMotoristaSchema = z.object({
    rotaId: uuidParam,
    motoristaId: uuidParam,
    inicio: z.string().regex(dateRegex, 'A data de início deve estar no formato YYYY-MM-DD.'),
    fim: z.string().regex(dateRegex, 'A data de fim deve estar no formato YYYY-MM-DD.').optional().or(z.literal('')),
}).refine(data => {
    if (!data.fim) return true;
    if (new Date(data.fim) < new Date(data.inicio)) {
        return false;
    }
    return true;
}, { message: 'A data de fim não pode ser anterior à data de início.' });

export const desativarMotoristaSchema = z.object({
    rotaId: uuidParam,
    motoristaId: uuidParam,
});
