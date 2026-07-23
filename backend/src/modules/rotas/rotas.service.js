import { prisma } from '../../config/prisma.js';
import { paginate, paginatedResponse } from '../../utils/pagination.js';

export async function createRota (nome) {
    const data = await prisma.rota.create({
      data: { nome },
    });
    return data;
}

export async function listRotas({ incluirInativas = false } = {}) {
    const where = {};
    if (!incluirInativas) where.status = "ativo";

    const data = await prisma.rota.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return data;
}

export async function getRotaById(id) {
    const data = await prisma.rota.findUnique({
      where: { id },
    });
    return data;
}

export async function listRotasPaginated({ page = 1, limit = 20, search = '', status = '' }) {
    const { skip, take } = paginate({ page, limit });
    const where = {};
    if (status) where.status = status;
    if (search) where.nome = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
        prisma.rota.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
        prisma.rota.count({ where }),
    ]);

    return paginatedResponse(data, total, { page, limit });
}

export async function updateRota(id, updates) {
    const data = await prisma.rota.update({
      where: { id },
      data: updates,
    });
    return data;
}

export async function setRotaStatus(id, status) {
    const data = await prisma.rota.update({
      where: { id },
      data: { status },
    });
    return data;
}
