import { z } from 'zod';
import { timeRegex } from '../../shared/schemas.js';

export const horaLimiteUpdateSchema = z.object({
    horaLimite: z.string()
        .regex(timeRegex, 'O campo hora deve estar no formato HH:mm (ex: 15:00).'),
});

export const logoUpdateSchema = z.object({
    logoUrl: z.string().url('O campo logoUrl deve ser uma URL válida.').max(500, 'O campo logoUrl deve ter no máximo 500 caracteres').or(z.literal('')),
});

export const nomeOrganizacaoUpdateSchema = z.object({
    nomeOrganizacao: z.string().min(3, 'O nome da organização deve ter no mínimo 3 caracteres.').max(100, 'O nome da organização deve ter no máximo 100 caracteres.'),
});

const timeField = z.string().regex(timeRegex, 'O campo deve estar no formato HH:mm (ex: 16:50).');

export const horariosViagemUpdateSchema = z.object({
    horaInicioIda: timeField.optional(),
    horaFimIda: timeField.optional(),
    horaInicioVolta: timeField.optional(),
    horaFimVolta: timeField.optional(),
});
