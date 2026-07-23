import { z } from 'zod';
import { uuidParam, dateRegex, TIPOS_SANGUINEOS, nomeField, emailField, senhaField, cpfField, telefoneField } from '../../shared/schemas.js';

export const signupRequestSchema = z.object({
  nome: nomeField,
  email: emailField,
  senha: senhaField,
  rg: z.string().max(20, 'O RG deve ter no máximo 20 caracteres').optional().or(z.literal('')),
  cpf: cpfField.optional().or(z.literal('')),
  telefone: telefoneField.optional().or(z.literal('')),
  data_nascimento: z.string().regex(dateRegex, 'A data de nascimento deve estar no formato YYYY-MM-DD').optional().or(z.literal('')),
  endereco: z.string().max(255, 'O endereço deve ter no máximo 255 caracteres').optional().or(z.literal('')),
  tipo_sanguineo: z.enum([...TIPOS_SANGUINEOS, '']).optional(),
  curso_id: uuidParam.optional(),
  comprovante_residencia_url: z.string().url().optional().or(z.literal('')),
  comprovante_matricula_url: z.string().url().optional().or(z.literal('')),
  foto_url: z.string().url().optional().or(z.literal('')),
});

export const signupUpdateDocsSchema = z.object({
  comprovante_matricula_url: z.string().optional().or(z.literal('')),
  comprovante_residencia_url: z.string().optional().or(z.literal('')),
  foto_url: z.string().optional().or(z.literal('')),
  status: z.enum(['pendente', 'ativo', 'reprovado']).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Pelo menos um campo deve ser fornecido para atualização' });

export const requestIdParamsSchema = z.object({
  id: uuidParam,
});
