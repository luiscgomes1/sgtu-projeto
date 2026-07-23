import { z } from "zod"

export const reenvioDocumentosSchema = z.object({
  comprovante_matricula: z.any(),
  comprovante_residencia: z.any(),
  foto: z.any(),
})
