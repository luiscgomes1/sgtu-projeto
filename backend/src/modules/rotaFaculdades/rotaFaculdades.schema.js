import Joi from 'joi';

const uuidRegex = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

export const rotaIdParamsSchema = Joi.object({
    rotaId: uuidRegex.label('ID da Rota'),
});

export const rotaFaculdadeBodySchema = Joi.object({
    rotaId: uuidRegex.label('ID da Rota'),
    faculdadeId: uuidRegex.label('ID da Faculdade'),
});

