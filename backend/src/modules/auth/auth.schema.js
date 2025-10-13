import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email deve ser um email válido",
      "any.required": "Email é obrigatório",
    }),
  senha: Joi.string().min(5).required().messages({
    "string.min": "A senha deve ter pelo menos {#limit} caracteres",
    "any.required": "A senha é obrigatória",
  }),
});
