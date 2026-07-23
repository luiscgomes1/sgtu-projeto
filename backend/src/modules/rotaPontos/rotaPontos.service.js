import { prisma } from "../../config/prisma.js";

export async function listByRota(rotaId, { incluirInativos = false } = {}) {
  const where = { rotaId };
  if (!incluirInativos) {
    where.status = "ativo";
  }

  const data = await prisma.rotaPonto.findMany({
    where,
    include: {
      ponto: {
        select: { id: true, nome: true, endereco: true, status: true },
      },
    },
    orderBy: { ordem: "asc" },
  });

  return data;
}

export async function updateOrder(rotaId, ordens) {
  const data = await Promise.all(
    ordens.map(({ id, ordem }) =>
      prisma.rotaPonto.upsert({
        where: { rotaId_pontoId: { rotaId, pontoId: id } },
        update: { ordem },
        create: { rotaId, pontoId: id, ordem },
      })
    )
  );
  return data;
}

export async function setStatus(rotaId, pontoId, status) {
  const data = await prisma.rotaPonto.update({
    where: { rotaId_pontoId: { rotaId, pontoId } },
    data: { status },
  });
  return data;
}

export async function isOrdered(rotaId) {
    const data = await prisma.rotaPonto.findMany({
      where: { rotaId },
      select: { ordem: true },
      orderBy: { ordem: "asc" },
    });

    const isOrdered = data.every((item, index) => item.ordem === index + 1);
    return isOrdered;
}
