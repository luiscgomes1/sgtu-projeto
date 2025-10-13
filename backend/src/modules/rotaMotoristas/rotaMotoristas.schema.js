import Joi from 'joi';

const uuidRegex = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const rotaIdParamsSchema = Joi.object({
    rotaId: uuidRegex.label('ID da Rota'),
});

export const atribuirMotoristaSchema = Joi.object({
    rotaId: uuidRegex.label('ID da Rota'),
    motoristaId: uuidRegex.label('ID do Motorista'),

    inicio: Joi.string().pattern(dateRegex).required().messages({
        'string.pattern.base': 'A data de início deve estar no formato YYYY-MM-DD.',
        'any.required': 'A data de início é obrigatória.',
    }),

    fim: Joi.string().pattern(dateRegex).allow(null, '').optional().messages({
        'string.pattern.base': 'A data de fim deve estar no formato YYYY-MM-DD.',
    }),
}).custom((value, helpers) => {
    if(value.fim && new Date(value.fim) < new Date(value.inicio)) {
        return helpers.error('date.min', { compareDate: 'inicio'});
    }
    return value;
}, 'Data check').messages({
    'date.min': 'A data de fim não pode ser anterior à data de início.'
});

export const desativarMotoristaSchema = Joi.object({
    rotaId: uuidRegex.label('ID da Rota'),
    motoristaId: uuidRegex.label('ID do Motorista'),
});