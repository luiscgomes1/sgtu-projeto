import { prisma } from '../../config/prisma.js'
import { paginate, paginatedResponse } from '../../utils/pagination.js'

export async function createFaculdade(payload) {
  
  const existing = await prisma.faculdade.findFirst({
    where: {
      OR: [
        { nome: payload.nome },
        { endereco: payload.endereco }
      ]
    }
  })

  if (existing) {
    if (existing.nome === payload.nome) {
      throw new Error("Já existe uma faculdade com esse nome.")
    }
    if (existing.endereco === payload.endereco) {
      throw new Error("Já existe uma faculdade com esse endereço.")
    }
    throw new Error("Faculdade já cadastrada.")
  }

  const faculdade = await prisma.faculdade.create({
    data: {
      nome: payload.nome,
      endereco: payload.endereco,
    },
  })
  
  return faculdade
}

export async function listFaculdades({ incluirInativas = false, naoVinculadas = false } = {}) {
  const where = incluirInativas ? {} : { status: 'ativo' };
  if (naoVinculadas) {
    where.rotaFaculdades = { none: { status: 'ativo' } };
  }
  const faculdades = await prisma.faculdade.findMany({
    where,
    orderBy: { nome: 'asc' },
  })
  
  return faculdades
}

export async function listFaculdadesPaginated({ page = 1, limit = 20, search = '', status = '' }) {
    const { skip, take } = paginate({ page, limit });
    const where = {};
    if (status) where.status = status;
    if (search) where.nome = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
        prisma.faculdade.findMany({ where, skip, take, orderBy: { nome: 'asc' } }),
        prisma.faculdade.count({ where }),
    ]);

    return paginatedResponse(data, total, { page, limit });
}

export async function updateFaculdade(id, payload) {
  const faculdade = await prisma.faculdade.update({
    where: { id },
    data: payload
  })
  
  return faculdade
}

export async function setFaculdadeStatus(id, status) {
  const faculdade = await prisma.faculdade.update({
    where: { id },
    data: { status }
  })
  
  return faculdade
}

export async function getFaculdadeById(id) {
  const faculdade = await prisma.faculdade.findUnique({
    where: { id }
  })

  return faculdade
}

export async function getFaculdadeByName(nome) {
  const faculdade = await prisma.faculdade.findFirst({
    where: { nome }
  })
  
  return faculdade
}
