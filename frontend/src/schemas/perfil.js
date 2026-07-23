import { z } from "zod"

export const perfilSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
})

export const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string().min(1, "Confirmação é obrigatória"),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "Senhas não conferem",
  path: ["confirmarSenha"],
})
