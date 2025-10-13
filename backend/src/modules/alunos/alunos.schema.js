import Joi from 'joi';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const timeRegex = /^(?:2[0-3]|[0-1]?[0-9]):[0-5][0-9]$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const alunoUpdateSchema = Joi.object({
    nome: Joi.string().min(3).max(100).optional().messages({
        'string.min': 'O nome deve ter pelo menos {#limit} caracteres',
        'string.max': 'O nome deve ter no máximo {#limit} caracteres',
    }),
    rg: Joi.string().min(5).max(20).optional().messages({
        'string.min': 'O RG deve ter pelo menos {#limit} caracteres',
        'string.max': 'O RG deve ter no máximo {#limit} caracteres',
    }),
    cpf: Joi.string().length(11).optional().allow('').messages({
        'string.length': 'O CPF deve ter exatamente {#limit} caracteres',
    }),
    telefone: Joi.string().max(15).optional().allow(''),
    endereco: Joi.string().max(255).optional().allow(''),
    data_nascimento: Joi.string().pattern(dateRegex).optional().allow(null, ''),
    tipo_sanguineo: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional().allow(''),
}).min(1);

export const alunoReenviarDocumentosSchema = Joi.object({
    nome: Joi.string().min(3).max(100).required().messages({
        'string.min': 'O nome deve ter pelo menos {#limit} caracteres',
        'string.max': 'O nome deve ter no máximo {#limit} caracteres',
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    rg: Joi.string().max(20).required(),
    cpf: Joi.string().length(11).required(),
    telefone: Joi.string().max(15).required(),
    data_nascimento: Joi.string().pattern(dateRegex).required(),
    endereco: Joi.string().max(255).required(),
    tipo_sanguineo: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required(),
    curso_id: Joi.string().pattern(uuidRegex).required(),

    // URLs de documentos (o service as marcará como pendentes no signup_requests)
    comprovante_residencia_url: Joi.string().optional().allow(null, ''),
    comprovante_matricula_url: Joi.string().optional().allow(null, ''),
    foto_url: Joi.string().optional().allow(null, ''),
});

export const alunoIdParamsSchema = Joi.object({
    id: Joi.string().pattern(uuidRegex).label('ID do Aluno'),
});