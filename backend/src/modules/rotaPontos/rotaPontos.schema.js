import Joi from 'joi';

const uuidRegex = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

export const rotaIdParamsSchema = Joi.object({
    rotaId: uuidRegex.label('ID da Rota'),
});

export const rotaPontoParamsSchema = Joi.object({
    rotaId: uuidRegex.label('ID da Rota'),
    pontoId: uuidRegex.label('ID do Ponto'),
});

export const rotaPontosOrdemSchema = Joi.object({
    ordens: Joi.array().items(
        Joi.object({
            id: uuidRegex.label('ID do Ponto'),
            ordem: Joi.number().integer().min(1).required().messages({
                'number.base': 'O campo ordem deve ser um número inteiro.',
                'number.min': 'O campo ordem deve ser no mínimo 1.',
                'any.required': 'O campo ordem é obrigatório.',
            }),
        }).required()
    ).min(1).required().messages({
        'array.base': 'O campo ordens deve ser uma lista (array).',
        'array.min': 'A lista de ordens não pode estar vazia.',
        'any.required': 'O campo ordens é obrigatório.',
    }),
});

export const pontoStatusSchema = Joi.object({
    status: Joi.string().valid('ativo', 'inativo').required().messages({
        'any.required': 'O status é obrigatório.',
        'any.only': 'O status deve ser "ativo" ou "inativo".',
    }),
});