import { prisma } from '../../config/prisma.js';

export async function vincularAlunoPonto(alunoId, pontoId) {
    await prisma.alunoPonto.updateMany({
      where: { alunoId, status: "ativo" },
      data: { status: "inativo" },
    });

    const existing = await prisma.alunoPonto.findUnique({
      where: { alunoId_pontoId: { alunoId, pontoId } },
    });

    if (existing) {
      const data = await prisma.alunoPonto.update({
        where: { alunoId_pontoId: { alunoId, pontoId } },
        data: { status: "ativo" },
      });
      return { message: "Vínculo reativado com sucesso.", data };
    }

    const data = await prisma.alunoPonto.create({
      data: { alunoId, pontoId, status: "ativo" },
    });
    return { message: "Aluno vinculado ao ponto com sucesso.", data };
}

export async function desvincularAlunoPonto(alunoId, pontoId) {
    await prisma.alunoPonto.updateMany({
      where: { alunoId, pontoId, status: "ativo" },
      data: { status: "inativo" },
    });
    return { message: "Aluno desvinculado do ponto com sucesso." };
}

export async function listarPontoDoAluno(alunoId) {
    const alunoPonto = await prisma.alunoPonto.findFirst({
      where: { alunoId, status: "ativo" },
      include: { ponto: { select: { id: true, nome: true, endereco: true } } },
    });

    if (!alunoPonto) return null;

    const aluno = await prisma.aluno.findUnique({
      where: { usuarioId: alunoId },
      include: { curso: { select: { faculdadeId: true } } },
    });
    const faculdadeId = aluno?.curso?.faculdadeId;
    if (!faculdadeId) return { ...alunoPonto, rota: null };

    const rotaPontos = await prisma.rotaPonto.findMany({
      where: { pontoId: alunoPonto.pontoId, status: "ativo" },
      select: { rotaId: true },
    });
    const rotaIds = rotaPontos.map(rp => rp.rotaId);

    if (!rotaIds.length) return { ...alunoPonto, rota: null };

    const rotaFaculdade = await prisma.rotaFaculdade.findFirst({
      where: { rotaId: { in: rotaIds }, faculdadeId, status: "ativo" },
    });
    if (!rotaFaculdade) return { ...alunoPonto, rota: null };

    const rota = await prisma.rota.findUnique({
      where: { id: rotaFaculdade.rotaId },
      select: { id: true, nome: true },
    });

    return {
        id: alunoPonto.pontoId,
        nome: alunoPonto.ponto?.nome,
        endereco: alunoPonto.ponto?.endereco,
        status: alunoPonto.status,
        rota: rota || null
    };
}

export async function listarAlunosDoPonto(pontoId) {
    const data = await prisma.alunoPonto.findMany({
      where: { pontoId, status: "ativo" },
      include: {
        aluno: {
          include: {
            usuario: { select: { nome: true } },
          },
        },
      },
    });

    return data.map(item => ({
        id: item.alunoId,
        nome: item.aluno?.usuario?.nome,
        status: item.status
    }));
}
