import Joi from 'joi';

const uuidRegex = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

export const viagemIdParamsSchema = Joi.object({
    viagemId: uuidRegex.label('ID da Viagem'),
});