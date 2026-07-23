import { prisma } from "../../config/prisma.js";
import { paginate, paginatedResponse } from '../../utils/pagination.js';

export async function createMotorista(payload) {
    const data = await prisma.motorista.create({
      data: {
        nome: payload.nome,
        cpf: payload.cpf,
        dataNascimento: payload.data_nascimento ? new Date(payload.data_nascimento) : undefined,
        telefone: payload.telefone,
        cnh: payload.cnh,
        validadeCnh: payload.validade_cnh ? new Date(payload.validade_cnh) : undefined,
      },
    });
    return data;
}

export async function listMotoristas({ incluirInativos = false } = {}) {
    const where = {};
    if (!incluirInativos) where.status = "ativo";

    const data = await prisma.motorista.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return data;
}

export async function getMotoristaById(id) {
    const data = await prisma.motorista.findUnique({
      where: { id },
    });
    return data;
}

export async function listMotoristasPaginated({ page = 1, limit = 20, search = '', status = '' }) {
    const { skip, take } = paginate({ page, limit });
    const where = {};
    if (status) where.status = status;
    if (search) where.nome = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
        prisma.motorista.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
        prisma.motorista.count({ where }),
    ]);

    return paginatedResponse(data, total, { page, limit });
}

export async function updateMotorista(id, payload) {
    const data = await prisma.motorista.update({
      where: { id },
      data: {
        nome: payload.nome,
        cpf: payload.cpf,
        cnh: payload.cnh,
        validadeCnh: payload.validade_cnh ? new Date(payload.validade_cnh) : undefined,
        dataNascimento: payload.data_nascimento ? new Date(payload.data_nascimento) : undefined,
        telefone: payload.telefone,
      },
    });
    return data;
}

export async function setMotoristaStatus(id, status) {
    const data = await prisma.motorista.update({
      where: { id },
      data: { status },
    });
    return data;
}
