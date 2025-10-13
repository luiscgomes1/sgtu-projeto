import Joi from "joi";

const uuidRegex = Joi.string().guid({ version: "uuidv4" }).required().messages({
  "string.guid": "O ID fornecido não é um UUID válido",
  "any.required": "O ID é obrigatório",
});

export const rotaCreateSchema = Joi.object({
  nome: Joi.string().min(3).max(100).required().messages({
    "string.min": "O nome deve ter pelo menos {#limit} caracteres",
    "string.max": "O nome deve ter no máximo {#limit} caracteres",
    "any.required": "O nome é obrigatório",
  }),
});

export const rotaUpdateSchema = Joi.object({
  nome: Joi.string().min(3).max(100).optional().messages({
    "string.min": "O nome deve ter pelo menos {#limit} caracteres",
    "string.max": "O nome deve ter no máximo {#limit} caracteres",
  }),
  status: Joi.string().valid("ativo", "inativo").optional(),
}).min(1).messages({
  "object.min": "Nome deve ser fornecido para atualização",
});

export const rotaIdParamSchema = Joi.object({
  id: uuidRegex.label("ID da Rota"),
});

export const rotaStatusSchema = Joi.object({
  status: Joi.string().valid("ativo", "inativo").required().messages({
    "any.required": "O status é obrigatório",
  }),
});
