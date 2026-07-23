import { prisma } from '../../config/prisma.js'
import { INCLUDE_ROTA_NOME } from "../../shared/includes.js"

export async function ensureViagem(rotaId, data) {
    const where = {}
    if (rotaId) where.rotaId = rotaId
    if (data) where.data = data

    const viagemExistente = await prisma.viagem.findFirst({
        where,
    })

    if (viagemExistente) return viagemExistente

    const viagemCriada = await prisma.viagem.create({
        data: {
            rotaId,
            data,
            status: "fechada"
        }
    })

    return viagemCriada
}

export async function listarViagens({ rotaId, data}) {
    const where = {}
    if (rotaId) where.rotaId = rotaId
    if (data) where.data = data

    const viagens = await prisma.viagem.findMany({
        where,
        include: { rota: INCLUDE_ROTA_NOME.rota },
        orderBy: { data: 'desc' },
    })

    return viagens
}

export async function detalharViagem(viagemId) {
    const viagemDetalhada = await prisma.viagem.findUnique({
        where: { id: viagemId },
        include: {
            rota: INCLUDE_ROTA_NOME.rota,
            presencas: {
                select: {
                    id: true,
                    confirmado: true,
                    confirmadoQrcode: true,
                    aluno: {
                        select: {
                            usuarioId: true,
                            usuario: { select: { nome: true } },
                        }
                    }
                }
            }
        }
    })

    return viagemDetalhada
}

export async function listarAlunosNaViagem(data) {
    const alunosNaViagem = await prisma.presenca.findMany({
        where: { data, status: 'ativo' },
        include: {
            rota: INCLUDE_ROTA_NOME.rota,
            aluno: {
                select: {
                    usuarioId: true,
                    usuario: { select: { nome: true } },
                    curso: {
                        select: {
                            faculdade: { select: { nome: true } }
                        }
                    }
                }
            }
        }
    })

    const agrupado = {}

    for (const p of alunosNaViagem) {
        const rota = p.rota.nome || 'Rota desconhecida'
        const faculdade = p.aluno.curso.faculdade.nome || 'Geral'
        const nomeAluno = p.aluno.usuario.nome || null

        if (!nomeAluno) continue

        if (!agrupado[rota]) agrupado[rota] = {}
        if (!agrupado[rota][faculdade]) agrupado[rota][faculdade] = []
        agrupado[rota][faculdade].push({ nome: nomeAluno, faculdade })
    }

    return agrupado
}

export async function listarResumoViagensHoje() {
    const alunosPorRota = await listarAlunosNaViagem(new Date())

    const resumo = {}
    for (const rota in alunosPorRota) {
        resumo[rota] = Object.values(alunosPorRota[rota]).reduce((acc, arr) => acc + arr.length, 0)
    }
    return resumo
}

export async function listarStatusVolta() {
    const presencas = await prisma.presenca.findMany({
        where: { data: new Date(), status: 'ativo', confirmadoQrcode: true },
        include: {
            rota: INCLUDE_ROTA_NOME.rota,
            aluno: {
                select: {
                    usuarioId: true,
                    usuario: { select: { nome: true } },
                    telefone: true,
                    curso: {
                        select: {
                            faculdade: { select: { nome: true } }
                        }
                    }
                }
            }
        }
    })

    const resumo = {}
    const alunosFaltando = []

    for (const p of presencas) {
        const rotaNome = p.rota.nome
        const aluno = {
            id: p.aluno.usuarioId,
            nome: p.aluno.usuario.nome,
            telefone: p.aluno.telefone,
            faculdade: p.aluno.curso.faculdade.nome,
            confirmadoVolta: p.confirmadoVolta
        }

        if (!resumo[rotaNome]) {
            resumo[rotaNome] = {
                totalIda: 0,
                totalVolta: 0,
                detalhes: [],
            }
        }

        resumo[rotaNome].totalIda += 1
        if (p.confirmadoVolta) {
            resumo[rotaNome].totalVolta += 1
        } else {
            alunosFaltando.push(aluno)
        }
        resumo[rotaNome].detalhes.push(aluno)
    }
    return {
        resumoPorRota: resumo,
        alunosFaltando: alunosFaltando,
        timestamp: new Date().toISOString(),
    }
}