import { prisma } from "../../config/prisma.js";
import { INCLUDE_ALUNO_PERFIL } from "../../shared/includes.js";

export async function listarAlunos() {
  const data = await prisma.aluno.findMany({
    where: { statusCadastro: { in: ['aprovado', 'ativo'] } },
    include: INCLUDE_ALUNO_PERFIL,
  });
  return data;
}

export async function listAlunosPaginated({
  status_cadastro,
  limit = 10,
  offset = 0,
  faculdade_id = null,
  curso_id = null,
  search = null,
}) {
  const where = {};

  if (status_cadastro) where.statusCadastro = status_cadastro;
  if (curso_id) where.cursoId = curso_id;

  if (faculdade_id) {
    where.curso = { faculdadeId: faculdade_id };
  }

  if (search) {
    const users = await prisma.usuario.findMany({
      where: {
        OR: [
          { nome: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    const ids = users.map((u) => u.id);
    if (ids.length === 0) {
      return { data: [], total: 0 };
    }

    where.usuarioId = { in: ids };
  }

  const [data, total] = await Promise.all([
    prisma.aluno.findMany({
      where,
      include: INCLUDE_ALUNO_PERFIL,
      skip: offset,
      take: limit,
    }),
    prisma.aluno.count({ where }),
  ]);

  return { data, total };
}

export async function obterEstatisticas({ status_cadastro } = {}) {
  const where = {};
  where.statusCadastro = status_cadastro ? { in: [status_cadastro] } : { in: ['aprovado', 'ativo'] };

  const [porCursoRows, cursos] = await Promise.all([
    prisma.aluno.groupBy({
      by: ['cursoId'],
      _count: true,
      where,
    }),
    prisma.curso.findMany({
      select: { id: true, nome: true, faculdadeId: true, faculdade: { select: { id: true, nome: true } } },
    }),
  ]);

  const cursoMap = Object.fromEntries(cursos.map(c => [c.id, c]));

  const porFaculdade = {};
  const porCurso = porCursoRows.map(r => {
    const curso = cursoMap[r.cursoId];
    const nome = curso?.nome || 'Desconhecido';
    const facId = curso?.faculdade?.id || curso?.faculdadeId || null;
    const facNome = curso?.faculdade?.nome || 'Desconhecida';

    if (!porFaculdade[facId]) {
      porFaculdade[facId] = { faculdade_id: facId, nome: facNome, total: 0 };
    }
    porFaculdade[facId].total += r._count;

    return { curso_id: r.cursoId || null, nome, total: r._count };
  });

  return {
    porCurso,
    porFaculdade: Object.values(porFaculdade),
  };
}

export async function obterAluno(id) {
  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: id },
    include: INCLUDE_ALUNO_PERFIL,
  });

  return aluno;
}

export async function obterMeuPerfil(id) {
  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: id },
    include: INCLUDE_ALUNO_PERFIL,
  });

  if (aluno) return aluno;

  return null;
}

export async function atualizarAluno(id, dados) {
  const { nome, ...resto } = dados;

  const data = await prisma.$transaction(async (tx) => {
    const aluno = await tx.aluno.update({
      where: { usuarioId: id },
      data: resto,
    });

    if (nome && nome.trim() !== "") {
      await tx.usuario.update({
        where: { id },
        data: { nome },
      });
    }

    return aluno;
  });

  return data;
}

export async function inativarAluno(id, statusCadastro = "inativo") {
  const usuarioStatus = statusCadastro === "ativo" ? "ativo" : "inativo";
  const [aluno] = await prisma.$transaction([
    prisma.aluno.update({
      where: { usuarioId: id },
      data: { statusCadastro },
    }),
    prisma.usuario.update({
      where: { id },
      data: { status: usuarioStatus },
    }),
  ]);
  return aluno;
}

export async function reenviarDocumentos(usuarioId, payload) {
  const alunoAtual = await prisma.aluno.findUnique({
    where: { usuarioId },
    select: { statusCadastro: true },
  });

  const [aluno] = await prisma.$transaction([
    prisma.aluno.update({
      where: { usuarioId },
      data: {
        rg: payload.rg,
        cpf: payload.cpf,
        telefone: payload.telefone,
        dataNascimento: payload.data_nascimento ? new Date(payload.data_nascimento) : undefined,
        endereco: payload.endereco,
        tipoSanguineo: payload.tipo_sanguineo,
        cursoId: payload.curso_id,
        comprovanteResidenciaUrl: payload.comprovante_residencia_url,
        comprovanteMatriculaUrl: payload.comprovante_matricula_url,
        fotoUrl: payload.foto_url,
        statusCadastro: "pendente",
      },
    }),
    prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nome: payload.nome,
        email: payload.email,
      },
    }),
    prisma.cadastroHistorico.create({
      data: {
        alunoId: usuarioId,
        statusAnterior: alunoAtual?.statusCadastro || "reprovado",
        statusNovo: "pendente",
        origem: "aluno",
        motivo: "Reenvio de documentos pelo aluno",
      },
    }),
  ]);

  const updated = await prisma.aluno.findUnique({
    where: { usuarioId },
    include: INCLUDE_ALUNO_PERFIL,
  });

  return updated;
}

export async function obterContagens() {
  const rows = await prisma.aluno.groupBy({
    by: ['statusCadastro'],
    _count: true,
    where: { statusCadastro: { in: ['pendente', 'ativo', 'reprovado'] } },
  });

  const map = Object.fromEntries(rows.map(r => [r.statusCadastro, r._count]));

  return {
    pendentes: map.pendente || 0,
    ativos: map.ativo || 0,
    reprovados: map.reprovado || 0,
  };
}
