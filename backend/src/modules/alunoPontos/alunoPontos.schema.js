import Joi from 'joi';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidSchema = Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'O ID fornecido não é um UUID válido',
    'any.required': 'O ID é obrigatório',
});

export const alunoPontoBodySchema = Joi.object({
    alunoId: uuidSchema.label('Aluno ID'),
    pontoId: uuidSchema.label('Ponto ID'),
});

export const alunoIdParamSchema = Joi.object({
    alunoId: uuidSchema.label('Aluno ID'),
});

export const pontoIdParamSchema = Joi.object({
    pontoId: uuidSchema.label('Ponto ID'),
});