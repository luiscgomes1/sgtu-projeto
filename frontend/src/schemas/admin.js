import { z } from "zod"

export const faculdadeSchema = z.object({
  nome: z.string().min(1, "Nome da faculdade é obrigatório"),
  rua: z.string().min(1, "Rua é obrigatória"),
  numero: z.string().optional().default(""),
  bairro: z.string().optional().default(""),
  cidade: z.string().optional().default(""),
})

export const cursoSchema = z.object({
  nome: z.string().min(1, "Nome do curso é obrigatório"),
  faculdade_id: z.string().min(1, "Faculdade é obrigatória"),
})

export const rotaSchema = z.object({
  nome: z.string().min(1, "Nome da rota é obrigatório"),
})

export const motoristaSchema = z.object({
  nome: z.string().min(1, "Nome completo é obrigatório"),
  cpf: z.string().optional().default(""),
  data_nascimento: z.string().optional().default(""),
  telefone: z.string().optional().default(""),
  cnh: z.string().optional().default(""),
  validade_cnh: z.string().optional().default(""),
})

export const pontoSchema = z.object({
  nome: z.string().min(1, "Nome do ponto é obrigatório"),
  enderecoRua: z.string().min(1, "Rua é obrigatória"),
  enderecoNumero: z.string().optional().default(""),
  enderecoBairro: z.string().optional().default(""),
  enderecoCidade: z.string().optional().default(""),
})

export const escalaManualSchema = z.object({
  grupos: z.array(z.object({
    motoristasIds: z.array(z.number()),
  })).min(1, "Pelo menos um grupo é necessário."),
})

