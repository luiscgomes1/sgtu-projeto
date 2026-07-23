import { z } from 'zod';
import { uuidParam } from '../../shared/schemas.js';

export const anoParamsSchema = z.object({
    ano: z.coerce.number().int().min(2020, 'O ano deve ser no mínimo 2020').max(2099, 'O ano deve ser no máximo 2099'),
});

export const anoMesParamsSchema = z.object({
    ano: z.coerce.number().int().min(2020, 'O ano deve ser no mínimo 2020').max(2099, 'O ano deve ser no máximo 2099'),
    mes: z.coerce.number().int().min(1, 'O mês deve ser um valor entre 1 e 12').max(12, 'O mês deve ser um valor entre 1 e 12'),
});

export const gerarAutomaticaSchema = z.object({
    ano: z.coerce.number().int().min(2020, 'O ano deve ser no mínimo 2020').max(2099, 'O ano deve ser no máximo 2099'),
    motoristasIds: z.array(uuidParam).min(1, 'É necessário fornecer pelo menos 1 motorista'),
});

export const gerarManualSchema = z.object({
    ano: z.coerce.number().int().min(2020, 'O ano deve ser no mínimo 2020').max(2099, 'O ano deve ser no máximo 2099'),
    distribuicao: z.array(
        z.object({
            motoristasIds: z.array(uuidParam).min(1, 'É necessário fornecer pelo menos 1 motorista'),
        })
    ).min(1, 'É necessário fornecer pelo menos 1 grupo de motoristas'),
});
