import { prisma } from '../../config/prisma.js';

export async function vincularFaculdade(rotaId, faculdadeId) {
    const existing = await prisma.rotaFaculdade.findUnique({
      where: { rotaId_faculdadeId: { rotaId, faculdadeId } },
    });

    if (existing) {
        await prisma.rotaFaculdade.update({
          where: { rotaId_faculdadeId: { rotaId, faculdadeId } },
          data: { status: "ativo" },
        });
        return { message: 'Faculdade já vinculada. Status atualizado para ativo.' };
    }

    await prisma.rotaFaculdade.create({
      data: { rotaId, faculdadeId },
    });
    return { message: 'Faculdade vinculada com sucesso.' };
}

export async function desvincularFaculdade(rotaId, faculdadeId) {
    await prisma.rotaFaculdade.update({
      where: { rotaId_faculdadeId: { rotaId, faculdadeId } },
      data: { status: "inativo" },
    });
    return { message: 'Faculdade desvinculada com sucesso.' };
}

export async function obterRotaPorFaculdade(faculdadeId) {
    const data = await prisma.rotaFaculdade.findFirst({
      where: { faculdadeId, status: "ativo" },
      select: { rotaId: true },
    });
    return data?.rotaId ?? null;
}

export async function listarFaculdadesDaRota(rotaId) {
    const data = await prisma.rotaFaculdade.findMany({
      where: { rotaId, status: "ativo" },
      include: {
        faculdade: { select: { nome: true } },
        rota: { select: { nome: true } },
      },
    });
    return data.map(f => ({
        id: f.faculdadeId,
        nome: f.faculdade.nome,
        status: f.status,
        rota: f.rota.nome,
        rotaId: rotaId
    }));
}
