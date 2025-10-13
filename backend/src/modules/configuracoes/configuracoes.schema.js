import Joi from 'joi';

const timeRegex = /^(?:2[0-3]|[0-1]?[0-9]):[0-5][0-9]$/;

export const horaLimiteUpdateSchema = Joi.object({
    horaLimite: Joi.string()
        .pattern(timeRegex)
        .required()
        .messages({
            'string.pattern.base': 'O campo hora deve estar no formato HH:mm (ex: 15:00).',
            'any.required': 'O campo hora é obrigatório'
        }),
});