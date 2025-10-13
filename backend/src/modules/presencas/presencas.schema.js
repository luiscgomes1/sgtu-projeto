import Joi from 'joi';

const uuidRegex = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

export const presencaManualSchema = Joi.object({
    alunoId: uuidRegex.label('ID do Aluno'),
    rotaId: uuidRegex.label('ID da Rota'),
});

export const marcarPresencaSchema = Joi.object({
    token: Joi.string().required().messages({
        'any.required': 'O token é obrigatório',
        'string.empty': 'O token não pode estar vazio',
    }),
    alunoId: uuidRegex.label('ID do Aluno').optional(),
});

export const rotaIdParamsSchema = Joi.object({
    rotaId: uuidRegex.label('ID da Rota'),
});

export const alunoIdParamsSchema = Joi.object({
    alunoId: uuidRegex.label('ID do Aluno'),
});

export const presencaIdParamsSchema = Joi.object({
    presencaId: uuidRegex.label('ID da Presença'),
});

export const validarTokenSchema = Joi.object({
    token: Joi.string().guid({ version: 'uuidv4' }).required().messages({
        'string.guid': 'O token fornecido não é um UUID válido',
        'any.required': 'O token é obrigatório',
        'string.empty': 'O token não pode estar vazio',
    }),
});