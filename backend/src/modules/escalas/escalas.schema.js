import Joi from 'joi';

const uuidRegex = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

export const anoParamsSchema = Joi.object({
    ano: Joi.number().integer().min(2020).max(2099).required().messages({
        'number.base': 'O ano deve ser um número inteiro',
        'number.min': 'O ano deve ser no mínimo {#limit}',
        'number.max': 'O ano deve ser no máximo {#limit}',
        'any.required': 'O ano é obrigatório',
    }),
});

export const anoMesParamsSchema = Joi.object({
    ano: Joi.number().integer().min(2020).max(2099).required(),
    mes: Joi.number().integer().min(1).max(12).required().messages({
        'number.min': 'O mês deve ser um valor entre {#limit} e 12',
        'number.max': 'O mês deve ser um valor entre 1 e {#limit}',
        'any.required': 'O mês é obrigatório',
    }),
});

export const gerarAutomaticaSchema = Joi.object({
    ano: Joi.number().integer().min(2020).max(2099).required(),
    motoristasIds: Joi.array().items(uuidRegex).min(2).required().custom((value, helpers) => {

        if (value.length % 2 !== 0) {
            return helpers.error('array.parity');
        }
        return value;
    }, 'Motoristas Party Check').messages({
        'array.min': 'É necessário fornecer pelo menos {#limit} motoristas',
        'array.parity': 'O número de motoristas deve ser par para a geração automática.',
        'any.required': 'Motoristas são obrigatórios',
    }),
});

export const gerarManualSchema = Joi.object({
    ano: Joi.number().integer().min(2020).max(2099).required(),
    pares: Joi.array().items(
        Joi.array().length(2).items(uuidRegex).required()
    ).min(1).required().messages({
        'array.min': 'É necessário fornecer pelo menos {#limit} par de motoristas',
        'any.required': 'Pares de motoristas são obrigatórios',
        'array.length': 'Cada par deve conter exatamente 2 motoristas',
    }),
});

export const anoMesSemanaParamsSchema = Joi.object({
    ano: Joi.number().integer().min(2020).max(2099).required(),
    mes: Joi.number().integer().min(1).max(12).required(),
    semana: Joi.number().integer().min(1).max(4).required().messages({
        'number.base': 'A semana deve ser um número inteiro',
        'number.min': 'A semana deve ser  um valor entre {#limit} e 4',
        'number.max': 'A semana deve ser um valor de no máximo 4',
        'any.required': 'A semana é obrigatória',
    }),
});

export const deifnirManualSchema = Joi.object({
    ano: Joi.number().integer().min(2020).max(2099).required(),
    mes: Joi.number().integer().min(1).max(12).required(),
    motorista1_id: uuidRegex.label('Motorista 1 ID'),
    motorista2_id: uuidRegex.label('Motorista 2 ID'),
});