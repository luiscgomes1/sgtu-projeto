import { prisma } from '../../config/prisma.js'
import { paginate, paginatedResponse } from '../../utils/pagination.js'
import { INCLUDE_FACULDADE } from "../../shared/includes.js"

export async function createCurso(payload) {
    const { faculdade_id, ...rest } = payload;
    const data = { ...rest, faculdadeId: faculdade_id };

    const existing = await prisma.curso.findFirst({
        where: {
            nome: data.nome,
            faculdadeId: data.faculdadeId
        }
    })

    if(existing) throw new Error('Curso já existe para esta faculdade.')
    
    const curso = await prisma.curso.create({
        data
    })

    return curso
}

export async function listCursos({ incluirInativos = false } = {}) {
    const cursos = await prisma.curso.findMany({
        include: INCLUDE_FACULDADE,
        orderBy: [
            { faculdadeId: 'asc' },
            { nome: 'asc' }
        ],
        where: incluirInativos ? {} : { status: 'ativo' }
    })

    return cursos
}

export async function listCursosPaginated({ page = 1, limit = 20, search = '', status = '', faculdade_id = '' }) {
    const { skip, take } = paginate({ page, limit });
    const where = {};
    if (status) where.status = status;
    if (faculdade_id) where.faculdadeId = faculdade_id;
    if (search) where.nome = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
        prisma.curso.findMany({
            where,
            include: INCLUDE_FACULDADE,
            skip,
            take,
            orderBy: [{ faculdadeId: 'asc' }, { nome: 'asc' }],
        }),
        prisma.curso.count({ where }),
    ]);

    return paginatedResponse(data, total, { page, limit });
}

export async function updateCurso(id, payload) {
    // Verifica duplicidade: existe outro curso com mesmo nome e faculdade_id?
    const existing = await prisma.curso.findFirst({
        where: {
            nome: payload.nome,
            faculdadeId: payload.faculdadeId,
            id: { not: id }
        }
    })

    if (existing) throw new Error('Já existe um curso com esse nome para esta faculdade.')

    const curso = await prisma.curso.update({
        where: { id },
        data: payload
    });

    return curso
}

export async function setCursoStatus(id, status) {
    const curso = await prisma.curso.update({
        where: { id },
        data: { status }
    });

    return curso
}

export async function getCursoById(id) {
    const curso = await prisma.curso.findUnique({
        where: { id },
        include: INCLUDE_FACULDADE
    })

    return curso
}

export async function listCursosByFaculdade(faculdadeId, { incluirInativos = false } = {}) {
    const cursosPorFaculdade = await prisma.curso.findMany({
        where: {
            faculdadeId: faculdadeId,
            ...(incluirInativos ? {} : { status: 'ativo' })
        },
        include: INCLUDE_FACULDADE,
        orderBy: {
            nome: 'asc'
        }
    })

    return cursosPorFaculdade;
}
