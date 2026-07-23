import { prisma } from "../../config/prisma.js";
import { truncDate } from "../../utils/functions.js";
import { INCLUDE_MOTORISTA_BASICO } from "../../shared/includes.js";

export async function atribuirMotorista(rotaId, motoristaId, inicio = null, fim = null) {
    const inicioIso = inicio ? truncDate(inicio) : truncDate();
    const fimIso = fim ? truncDate(fim) : null;

    const existingList = await prisma.rotaMotorista.findMany({
        where: { rotaId, motoristaId },
    });

    const overlaps = (existingList || []).filter((ex) => {
        const exInicio = ex.inicio ? truncDate(ex.inicio) : null;
        const exFim = ex.fim ? truncDate(ex.fim) : null;
        const aStart = exInicio;
        const aEnd = exFim || '9999-12-31';
        const bStart = inicioIso;
        const bEnd = fimIso || '9999-12-31';
        return !(aEnd < bStart || bEnd < aStart);
    });

    if (overlaps.length) {
        const existing = overlaps[0];
        if (existing.status !== 'ativo') {
            await prisma.rotaMotorista.update({
                where: { id: existing.id },
                data: { status: 'ativo', inicio: new Date(inicioIso), fim: fimIso ? new Date(fimIso) : null },
            });
            return { message: 'Vínculo existente reativado com sucesso.' };
        }
        return { message: 'Existe um vínculo ativo que se sobrepõe ao período informado.' };
    }

    await prisma.rotaMotorista.create({
        data: {
            rotaId,
            motoristaId,
            inicio: new Date(inicioIso),
            fim: fimIso ? new Date(fimIso) : null,
        },
    });

    return { message: 'Motorista atribuído à rota com sucesso.' };
}

export async function desativarMotorista(rotaId, motoristaId) {
    const today = new Date();
    await prisma.rotaMotorista.updateMany({
        where: { rotaId, motoristaId, status: 'ativo' },
        data: { status: 'inativo', fim: today },
    });

    return { message: 'Motorista desativado da rota com sucesso.' };
}

export async function listarMotoristasDaRota(rotaId) {
    const data = await prisma.rotaMotorista.findMany({
        where: { rotaId, status: 'ativo' },
        include: {
            motorista: INCLUDE_MOTORISTA_BASICO.motorista,
        },
        orderBy: { inicio: 'asc' },
    });

    return data;
}
