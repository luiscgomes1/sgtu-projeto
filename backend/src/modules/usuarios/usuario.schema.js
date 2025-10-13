import Joi from 'joi';

export const usuarioUpdateSchema = Joi.object({
    nome: Joi.string().min(3).max(100).required().messages({
        'string.base': 'O nome deve ser uma string',
        'string.empty': 'O nome não pode ser vazio',
        'string.min': 'O nome deve ter pelo menos {#limit} caracteres',
        'string.max': 'O nome deve ter no máximo {#limit} caracteres',
        'any.required': 'O nome é obrigatório',
    }),
});

export const alterarSenhaSchema = Joi.object({
    senhaAtual: Joi.string().min(5).required().messages({
        'string.base': 'A senha atual deve ser uma string',
        'string.empty': 'A senha atual não pode ser vazia',
        'string.min': 'A senha atual deve ter pelo menos {#limit} caracteres',
        'any.required': 'A senha atual é obrigatória',
    }),
    novaSenha: Joi.string().min(5).required().disallow(Joi.ref('senhaAtual')).messages({
        'string.base': 'A nova senha deve ser uma string',
        'string.empty': 'A nova senha não pode ser vazia',
        'string.min': 'A nova senha deve ter pelo menos {#limit} caracteres',
        'any.required': 'A nova senha é obrigatória',
        'any.invalid': 'A nova senha deve ser diferente da senha atual',
    }),
});
