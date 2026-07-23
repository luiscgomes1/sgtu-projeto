import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
})

export const cadastroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  rg: z.string().min(1, "RG é obrigatório"),
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .refine((val) => val.replace(/\D/g, "").length === 11, "CPF deve conter 11 dígitos"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  tipo_sanguineo: z.string().min(1, "Tipo sanguíneo é obrigatório"),
  faculdade_id: z.string().min(1, "Faculdade é obrigatória"),
  curso_id: z.string().min(1, "Curso é obrigatório"),
  logradouro: z.string().min(1, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
})
