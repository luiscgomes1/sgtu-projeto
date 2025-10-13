import Joi from "joi";

const uuidRegex = Joi.string().guid({ version: "uuidv4" }).required().messages({
  "string.guid": "O ID fornecido não é um UUID válido",
  "any.required": "O ID é obrigatório",
});

export const faculdadeCreateSchema = Joi.object({
  nome: Joi.string().min(3).max(100).required().messages({
    "string.min": "O nome deve ter pelo menos {#limit} caracteres",
    "string.max": "O nome deve ter no máximo {#limit} caracteres",
    "any.required": "O nome é obrigatório",
  }),
  endereco: Joi.string().min(5).max(200).required().messages({
    "string.min": "O endereço deve ter pelo menos {#limit} caracteres",
    "string.max": "O endereço deve ter no máximo {#limit} caracteres",
    "any.required": "O endereço é obrigatório",
  }),
});

export const faculdadeUpdateSchema = Joi.object({
  nome: Joi.string().min(3).max(100).optional().messages({
    "string.min": "O nome deve ter pelo menos {#limit} caracteres",
    "string.max": "O nome deve ter no máximo {#limit} caracteres",
  }),
  endereco: Joi.string().min(5).max(200).optional().messages({
    "string.min": "O endereço deve ter pelo menos {#limit} caracteres",
    "string.max": "O endereço deve ter no máximo {#limit} caracteres",
  }),
  status: Joi.string().valid("ativo", "inativo").optional(),
}).min(1);

export const faculdadeIdParamSchema = Joi.object({
  id: uuidRegex.label("ID da Faculdade"),
});

export const faculdadeNomeParamsSchema = Joi.object({
  nome: Joi.string().min(3).max(100).required().messages({
    "string.min": "O nome deve ter pelo menos {#limit} caracteres",
    "string.max": "O nome deve ter no máximo {#limit} caracteres",
    "any.required": "O nome da faculdade é obrigatório",
  }),
});