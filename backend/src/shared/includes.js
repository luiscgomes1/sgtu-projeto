export const INCLUDE_FACULDADE = { faculdade: true }

export const INCLUDE_ALUNO_PERFIL = {
  usuario: { select: { id: true, nome: true, email: true, tipo: true, status: true } },
  curso: { include: { faculdade: { select: { id: true, nome: true } } } },
}

export const INCLUDE_ALUNO_STATUS = { usuario: { select: { tipo: true, status: true } } }

export const INCLUDE_USUARIO_NOME = { usuario: { select: { nome: true } } }

export const INCLUDE_ROTA_NOME = { rota: { select: { nome: true } } }

export const INCLUDE_CURSO_NOME = { curso: { select: { id: true, nome: true } } }

export const INCLUDE_CURSO_FACULDADE = { curso: { include: { faculdade: { select: { id: true, nome: true } } } } }

export const INCLUDE_MOTORISTA_BASICO = { motorista: { select: { id: true, nome: true, telefone: true, status: true } } }
