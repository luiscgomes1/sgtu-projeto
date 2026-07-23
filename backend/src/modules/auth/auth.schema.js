import { z } from 'zod';
import { emailField } from '../../shared/schemas.js';

export const loginSchema = z.object({
  email: emailField,
  senha: z.string().min(5, 'A senha deve ter pelo menos 5 caracteres'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});
