import Joi from 'joi';

const uuidRegex = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

export const alunoIdParamsSchema = Joi.object({
    alunoId: uuidRegex.label('ID do Aluno'),
});

export const validarQrCodeSchema = Joi.object({
    token: Joi.string().guid({ version: 'uuidv4' }).required().messages({
        'string.guid': 'O token fornecido não é um UUID válido',
        'any.required': 'O token é obrigatório',
    }),
});