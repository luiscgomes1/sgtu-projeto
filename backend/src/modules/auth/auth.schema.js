import { z } from 'zod';
import { emailField, senhaField } from '../../shared/schemas.js';

export const loginSchema = z.object({
  email: emailField,
  senha: senhaField,
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});
