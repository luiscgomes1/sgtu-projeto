import Joi from 'joi';

const uuidRegex = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

export const cursoCreateSchema = Joi.object({
    nome: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'O nome do curso deve ter pelo menos {#limit} caracteres.',
            'string.max': 'O nome do curso deve ter no máximo {#limit} caracteres.',
            'any.required': 'O nome do curso é obrigatório.'
        }),
    faculdade_id: uuidRegex.label('ID da Faculdade'),
});

export const cursoUpdateSchema = Joi.object({
    nome: Joi.string()
        .min(3)
        .max(100)
        .optional()
        .messages({
            'string.min': 'O nome do curso deve ter pelo menos {#limit} caracteres.',
            'string.max': 'O nome do curso deve ter no máximo {#limit} caracteres.',
        }),
    faculdade_id: uuidRegex.label('ID da Faculdade'),
    status: Joi.string().valid('ativo', 'inativo').optional(),
}).min(1);

export const cursoIdParamSchema = Joi.object({
    id: uuidRegex.label('ID do Curso'),
});
