import { prisma } from "../../config/prisma.js";
import { paginate, paginatedResponse } from '../../utils/pagination.js';

export async function createPonto(payload) {
    const ponto = await prisma.ponto.create({
      data: { nome: payload.nome, endereco: payload.endereco },
    });

    return ponto;
}

export async function listPontos({ incluirInativos = false } = {}) {
    const where = {};
    if (!incluirInativos) where.status = "ativo";

    const data = await prisma.ponto.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return data;
}

export async function getPontoById(id) {
    const data = await prisma.ponto.findUnique({
      where: { id },
    });
    return data;
}

export async function listPontosPaginated({ page = 1, limit = 20, search = '', status = '' }) {
    const { skip, take } = paginate({ page, limit });
    const where = {};
    if (status) where.status = status;
    if (search) where.nome = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
        prisma.ponto.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
        prisma.ponto.count({ where }),
    ]);

    return paginatedResponse(data, total, { page, limit });
}

export async function updatePonto(id, payload) {
    const data = await prisma.ponto.update({
      where: { id },
      data: payload,
    });
    return data;
}

export async function setPontoStatus(id, status) {
    const data = await prisma.ponto.update({
      where: { id },
      data: { status },
    });
    return data;
}
