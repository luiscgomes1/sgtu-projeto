import { z } from 'zod';
import { uuidParam, dateRegex, TIPOS_SANGUINEOS, nomeField, emailField, cpfField, telefoneField } from '../../shared/schemas.js';

export const alunoUpdateSchema = z.object({
    nome: nomeField.optional(),
    rg: z.string().min(5, 'O RG deve ter pelo menos 5 caracteres').max(20, 'O RG deve ter no máximo 20 caracteres').optional(),
    cpf: cpfField.optional().or(z.literal('')),
    telefone: telefoneField.optional().or(z.literal('')),
    endereco: z.string().max(255, 'O endereço deve ter no máximo 255 caracteres').optional().or(z.literal('')),
    data_nascimento: z.string().regex(dateRegex, 'A data de nascimento deve estar no formato YYYY-MM-DD').optional().or(z.literal('')),
    tipo_sanguineo: z.enum([...TIPOS_SANGUINEOS, '']).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Pelo menos um campo deve ser fornecido para atualização' });

export const alunoReenviarDocumentosSchema = z.object({
    nome: nomeField,
    email: emailField,
    rg: z.string().max(20, 'O RG deve ter no máximo 20 caracteres'),
    cpf: cpfField,
    telefone: telefoneField,
    data_nascimento: z.string().regex(dateRegex, 'A data de nascimento deve estar no formato YYYY-MM-DD'),
    endereco: z.string().max(255, 'O endereço deve ter no máximo 255 caracteres'),
    tipo_sanguineo: z.enum(TIPOS_SANGUINEOS),
    curso_id: uuidParam,
    comprovante_residencia_url: z.string().optional().or(z.literal('')),
    comprovante_matricula_url: z.string().optional().or(z.literal('')),
    foto_url: z.string().optional().or(z.literal('')),
});

export const alunoIdParamsSchema = z.object({
    id: uuidParam,
});
