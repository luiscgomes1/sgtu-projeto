import Joi from "joi";

const uuidRegex = Joi.string().guid({ version: "uuidv4" }).required().messages({
  "string.guid": "O ID fornecido não é um UUID válido.",
  "any.required": "O ID é obrigatório.",
});
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const signupRequestSchema = Joi.object({
  nome: Joi.string().min(3).max(100).required().messages({
    "string.min": "O nome deve ter no mínimo 3 caracteres.",
    "any.required": "O nome é obrigatório.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "O e-mail deve ser válido.",
      "any.required": "O e-mail é obrigatório.",
    }),
  senha: Joi.string().min(6).required().messages({
    "string.min": "A senha deve ter no mínimo 6 caracteres.",
    "any.required": "A senha é obrigatória.",
  }),

  rg: Joi.string().max(20).optional().allow(null, ""),
  cpf: Joi.string().length(11).optional().allow(null, ""), 
  telefone: Joi.string().max(15).optional().allow(null, ""),
  data_nascimento: Joi.string().pattern(dateRegex).optional().allow(null, ""),
  endereco: Joi.string().max(255).optional().allow(null, ""),
  tipo_sanguineo: Joi.string()
    .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
    .optional()
    .allow(null, ""),
  curso_id: uuidRegex.optional().allow(null),

  comprovante_residencia_url: Joi.string().uri().optional().allow(null, ""),
  comprovante_matricula_url: Joi.string().uri().optional().allow(null, ""),
  foto_url: Joi.string().uri().optional().allow(null, ""),
});

export const signupUpdateDocsSchema = Joi.object({
  comprovante_matricula_url: Joi.string().optional().allow(null, ""),
  comprovante_residencia_url: Joi.string().optional().allow(null, ""),
  foto_url: Joi.string().optional().allow(null, ""),
  status: Joi.string().valid("pendente", "aprovado", "reprovado").optional(),
}).min(1);

export const requestIdParamsSchema = Joi.object({
  id: uuidRegex.label("ID da Requisição"),
});
