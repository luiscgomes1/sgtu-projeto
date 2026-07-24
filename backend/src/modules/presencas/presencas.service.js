import { gethoraLimitePresenca, getHorariosViagem } from '../configuracoes/configuracoes.service.js'
import { prisma } from '../../config/prisma.js'
import { ensureViagem } from '../viagens/viagens.service.js'
import { formatHHMM } from '../../utils/functions.js'
import { ensureCarteirinhaValidaOuAtualizaStatus } from '../../shared/validarCarteirinha.js'
import { logger } from '../../config/logger.js'
import { INCLUDE_ROTA_NOME, INCLUDE_USUARIO_NOME } from '../../shared/includes.js'

async function validarAlunoAtivo(alunoId) {
  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: alunoId },
    include: { usuario: { select: { status: true, tipo: true } } },
  })

  if (!aluno) throw new Error("Aluno não encontrado")
  if (aluno.usuario.status !== "ativo") throw new Error("Aluno não está ativo no sistema")
  if (aluno.usuario.tipo !== "aluno") throw new Error("Usuário não é do tipo aluno")
  if (aluno.statusCadastro !== "aprovado") throw new Error("Cadastro do aluno não está aprovado")

  return aluno
}

export async function listarPresencasPorRota(rotaId, data) {
    const filtroData = data || new Date()

    const presencas = await prisma.presenca.findMany({
        where: { rotaId, data: filtroData, status: 'ativo' },
        include: {
            rota: INCLUDE_ROTA_NOME.rota,
            aluno: {
                select: {
                    usuarioId: true,
                    usuario: INCLUDE_USUARIO_NOME.usuario,
                }
            }
        }
    })

    return presencas
}

export async function listarPresencasPorAluno(alunoId) {
    const presencasPorAluno = await prisma.presenca.findMany({
        where: { alunoId, status: 'ativo' },
        include: {
            rota: INCLUDE_ROTA_NOME.rota,
        },
        orderBy: { data: 'desc' }
    })

    return presencasPorAluno
}

export async function desativarPresenca(presencaId) {
    const data = await prisma.presenca.update({
        where: { id: presencaId },
        data: { status: 'inativo' },
    })

    return data
}

export async function marcarPresenca(alunoId, rotaId) {
    await ensureCarteirinhaValidaOuAtualizaStatus(alunoId)
    const hoje = new Date()
    const viagem = await ensureViagem(rotaId, hoje)

    await validarAlunoAtivo(alunoId)

    const horaLimite = await gethoraLimitePresenca()
    if(!horaLimite) throw new Error("Horário limite para marcar presença não está configurado no sistema")
    const agora = new Date()
    const horaLimiteStr = typeof horaLimite === 'object'
      ? `${String(horaLimite.getHours()).padStart(2, '0')}:${String(horaLimite.getMinutes()).padStart(2, '0')}`
      : horaLimite;
    const [limiteHoras, limiteMinutos] = horaLimiteStr.split(':').map(Number)
    const limite = new Date()
    limite.setHours(limiteHoras, limiteMinutos, 0, 0)

    if (agora > limite) {
        throw new Error(`Horário limite para marcar presença é ${formatHHMM(limite)}.`)
    }

    const data = await prisma.presenca.upsert({
        where: { alunoId_data: { alunoId, data: hoje } },
        update: { confirmado: true },
        create: {
            alunoId,
            rotaId,
            viagemId: viagem.id,
            data: hoje,
            confirmado: true,
            confirmado_qrcode: false,
        },
    })

    return { message: "Presença atualizada (pré-checkin)", data }
}

export async function confirmarPresencaIdaQrCode(alunoId) {

    const hoje = new Date()
    const agora = new Date()

    const horarios = await getHorariosViagem()
    const horaInicioIda = process.env.QR_CODE_IDA_INICIO || (horarios.horaInicioIda ? `${String(horarios.horaInicioIda.getHours()).padStart(2, '0')}:${String(horarios.horaInicioIda.getMinutes()).padStart(2, '0')}` : "16:50")
    const horaFimIda = process.env.QR_CODE_IDA_FIM || (horarios.horaFimIda ? `${String(horarios.horaFimIda.getHours()).padStart(2, '0')}:${String(horarios.horaFimIda.getMinutes()).padStart(2, '0')}` : "18:00")

    const [hInicio, mInicio] = horaInicioIda.split(':').map(Number)
    const [hFim, mFim] = horaFimIda.split(':').map(Number)

    const inicioIda = new Date()
    inicioIda.setHours(hInicio, mInicio, 0, 0)
    const fimIda = new Date()
    fimIda.setHours(hFim, mFim, 0, 0)

    if(agora < inicioIda) throw new Error(`A confirmação da ida só pode ser feita após as ${horaInicioIda}.`)
    if(agora > fimIda) throw new Error(`A confirmação da ida só pode ser feita até as ${horaFimIda}.`)

    await validarAlunoAtivo(alunoId)

    const presencaExistente = await prisma.presenca.findFirst({
        where: { alunoId, data: hoje }
    })

    if (!presencaExistente) return { message: "Aluno não marcou presença antes do embarque" }

    // Se já confirmarou a presença via QR code, lançar erro informativo
    if (presencaExistente.confirmadoQrcode) {
        throw new Error("Aluno já confirmou presença via QR Code")
    }

    const data = await prisma.presenca.update({
        where: { id: presencaExistente.id },
        data: { confirmadoQrcode: true }
    })
    return { message: "Embarque confirmado via QR Code", data }
}

export async function confirmarPresencaVoltaQrCode(alunoId) {

    const hoje = new Date()
    const agora = new Date()

    const horarios = await getHorariosViagem()
    const horaInicioVolta = process.env.QR_CODE_VOLTA_INICIO || (horarios.horaInicioVolta ? `${String(horarios.horaInicioVolta.getHours()).padStart(2, '0')}:${String(horarios.horaInicioVolta.getMinutes()).padStart(2, '0')}` : "21:00")
    const horaFimVolta = process.env.QR_CODE_VOLTA_FIM || (horarios.horaFimVolta ? `${String(horarios.horaFimVolta.getHours()).padStart(2, '0')}:${String(horarios.horaFimVolta.getMinutes()).padStart(2, '0')}` : "23:00")

    const [hInicio, mInicio] = horaInicioVolta.split(':').map(Number)
    const [hFim, mFim] = horaFimVolta.split(':').map(Number)

    const inicioVolta = new Date()
    inicioVolta.setHours(hInicio, mInicio, 0, 0)
    const fimVolta = new Date()
    fimVolta.setHours(hFim, mFim, 0, 0)

    if(agora < inicioVolta) throw new Error(`A confirmação da volta só pode ser feita após as ${horaInicioVolta}.`)
    if(agora > fimVolta) throw new Error(`A confirmação da volta só pode ser feita até as ${horaFimVolta}.`)

    await validarAlunoAtivo(alunoId)

    let presencaExistente = await prisma.presenca.findFirst({
        where: { alunoId, data: hoje }
    })

    if(!presencaExistente) {
        try {
            const alunoData = await prisma.aluno.findUnique({
                where: { usuarioId: alunoId },
                include: {
                    curso: {
                        select: {
                            faculdadeId: true
                        }
                    }
                }
            })

            if (alunoData?.curso?.faculdadeId) {
                const rotaIdObj = await prisma.rotaFaculdade.findFirst({
                    where: {
                        faculdadeId: alunoData.curso.faculdadeId,
                        status: 'ativo'
                    }
                })

                if (rotaIdObj.rotaId) {
                    const rotaId = rotaIdObj.rotaId
                    const existing = await prisma.presenca.findFirst({
                        where: { alunoId, rotaId, data: hoje }
                    })

                    if (existing) {
                        presencaExistente = existing
                    }
                }
            }
        } catch (fallbackErr) {
            logger.warn({ err: fallbackErr }, 'Erro ao tentar inferir rota para confirmar volta')
        }
    }

    if(!presencaExistente) throw new Error("Aluno não marcou presença na ida.")

    if(!presencaExistente.confirmadoQrcode) throw new Error("Aluno não confirmou embarque na ida (via QR Code).")

    if(presencaExistente.confirmadoVolta) throw new Error("Aluno já confirmou volta via QR Code")

    const presenca = await prisma.presenca.update({
        where: { id: presencaExistente.id },
        data: { confirmadoVolta: true }
    })

    return { message: "Embarque de volta confirmado via QR Code", presenca }
    
}