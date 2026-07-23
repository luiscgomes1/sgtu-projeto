import { z } from 'zod';
import { nomeField, senhaField } from '../../shared/schemas.js';

export const usuarioUpdateSchema = z.object({
    nome: nomeField,
});

export const alterarSenhaSchema = z.object({
    senhaAtual: z.string().min(5, 'A senha atual deve ter pelo menos 5 caracteres'),
    novaSenha: senhaField,
}).refine(data => data.novaSenha !== data.senhaAtual, { message: 'A nova senha deve ser diferente da senha atual' });
