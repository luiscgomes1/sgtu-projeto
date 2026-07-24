import { prisma } from '../config/prisma.js'

export async function ensureCarteirinhaValidaOuAtualizaStatus(alunoUsuarioId) {
  const carteirinha = await prisma.carteirinha.findFirst({
    where: {
      alunoId: alunoUsuarioId,
      dataValidade: { gte: new Date() }
    },
    orderBy: { dataValidade: 'desc' }
  })

  if (!carteirinha) {
    throw new Error('Carteirinha inválida ou expirada.')
  }
}
