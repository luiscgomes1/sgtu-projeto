import Joi from 'joi';

const uuidRegex = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const motoristaCreateSchema = Joi.object({
    nome: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'O nome deve ter pelo menos 3 caracteres',
            'string.max': 'O nome deve ter no máximo 100 caracteres',
            'any.required': 'O nome é obrigatório',
        }),
    cpf: Joi.string()
        .length(11)
        .required()
        .messages({
            'string.length': 'O CPF deve ter 11 dígitos (apenas números).',
            'any.required': 'O CPF é obrigatório',
        }),
    data_nascimento: Joi.string()
        .pattern(dateRegex)
        .required()
        .messages({
            'string.pattern.base': 'A data de nascimento deve estar no formato YYYY-MM-DD',
            'any.required': 'A data de nascimento é obrigatória',
        }),
    telefone: Joi.string()
        .min(10)
        .max(11)
        .required()
        .messages({
            'string.min': 'O telefone deve ter pelo menos 10 dígitos.',
            'string.max': 'O telefone deve ter no máximo 11 dígitos.',
            'any.required': 'O telefone é obrigatório.',
        }),
    cnh: Joi.string()
        .min(9)
        .max(11)
        .required()
        .messages({
            'string.min': 'A CNH deve ter pelo menos 9 dígitos.',
            'string.max': 'A CNH deve ter no máximo 11 dígitos.',
            'any.required': 'A CNH é obrigatória.',
        }),
    validade_cnh: Joi.string()
        .pattern(dateRegex)
        .required()
        .messages({
            'string.pattern.base': 'A validade da CNH deve estar no formato YYYY-MM-DD',
            'any.required': 'A validade da CNH é obrigatória',
        }),
});

export const motoristaUpdateSchema = Joi.object({
    nome: Joi.string()
        .min(3)
        .max(100)
        .optional()
        .messages({
            'string.min': 'O nome deve ter pelo menos 3 caracteres',
            'string.max': 'O nome deve ter no máximo 100 caracteres',
        }),
    cpf: Joi.string()
        .length(11)
        .optional()
        .messages({
            'string.length': 'O CPF deve ter 11 dígitos (apenas números).',
        }),
    data_nascimento: Joi.string()
        .pattern(dateRegex)
        .optional()
        .messages({
            'string.pattern.base': 'A data de nascimento deve estar no formato YYYY-MM-DD',
        }),
    telefone: Joi.string()
        .min(10)
        .max(11)
        .optional()
        .messages({
            'string.min': 'O telefone deve ter pelo menos 10 dígitos.',
            'string.max': 'O telefone deve ter no máximo 11 dígitos.',
        }),
    cnh: Joi.string()
        .min(9)
        .max(11)
        .optional()
        .messages({
            'string.min': 'A CNH deve ter pelo menos 9 dígitos.',
            'string.max': 'A CNH deve ter no máximo 11 dígitos.',
        }),
    validade_cnh: Joi.string()
        .pattern(dateRegex)
        .optional()
        .messages({
            'string.pattern.base': 'A validade da CNH deve estar no formato YYYY-MM-DD',
        }),
    status: Joi.string().valid('ativo', 'inativo').optional(),
}).min(1);

export const motoristaIdParamsSchema = Joi.object({
    id: uuidRegex.label('ID do Motorista'),
});
