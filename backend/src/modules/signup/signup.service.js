import { prisma } from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import { getSignedUrl } from "../../config/storage.js";
import { notifySignupApproved, notifySignupReproved, notifyReenvioApproved } from "../../bot/notifications.js";
import { logger } from "../../config/logger.js";
import { truncDate } from "../../utils/functions.js";
import {
  gerarCarteirinha,
  listarCarteirinhas,
} from "../carteirinhas/carteirinhas.service.js";
import { INCLUDE_CURSO_NOME, INCLUDE_USUARIO_NOME } from "../../shared/includes.js";

export async function createSignupRequest(payload) {
  const telefone = payload.telefone
    ? payload.telefone.replace(/\D/g, "")
    : null;
  const cpf = payload.cpf ? payload.cpf.replace(/\D/g, "") : null;

  const senhaHash = await bcrypt.hash(payload.senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nome: payload.nome,
      email: payload.email,
      senhaHash,
      tipo: "aluno",
      status: "ativo",
      aluno: {
        create: {
          rg: payload.rg || null,
          cpf: cpf,
          telefone: telefone,
          dataNascimento: payload.data_nascimento
            ? new Date(payload.data_nascimento)
            : null,
          endereco: payload.endereco || null,
          tipoSanguineo: payload.tipo_sanguineo || null,
          cursoId: payload.curso_id || null,
          comprovanteResidenciaUrl: payload.comprovante_residencia_url || null,
          comprovanteMatriculaUrl: payload.comprovante_matricula_url || null,
          fotoUrl: payload.foto_url || null,
          statusCadastro: "pendente",
        },
      },
    },
    select: {
      id: true, nome: true, email: true, tipo: true, status: true, createdAt: true,
      aluno: true,
    },
  });

  return usuario;
}

export async function updateSignupRequest(requestId, payload) {
  const { comprovante_matricula_url, comprovante_residencia_url, foto_url } =
    payload;

  const existing = await prisma.aluno.findUnique({
    where: { usuarioId: requestId },
    select: { statusCadastro: true },
  });
  if (!existing) throw new Error('Solicitação de cadastro não encontrada.');
  if (existing.statusCadastro !== 'pendente') throw new Error('Solicitação já processada não pode ser alterada.');

  const aluno = await prisma.aluno.update({
    where: { usuarioId: requestId },
    data: {
      comprovanteMatriculaUrl: comprovante_matricula_url,
      comprovanteResidenciaUrl: comprovante_residencia_url,
      fotoUrl: foto_url,
    },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, tipo: true, status: true },
      },
    },
  });

  return aluno;
}

export async function listRequests() {
  const hoje = truncDate();

  const data = await prisma.aluno.findMany({
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, status: true, createdAt: true },
      },
      curso: INCLUDE_CURSO_NOME.curso,
      carteirinhas: {
        where: { dataValidade: { gte: new Date(hoje) } },
        orderBy: { dataValidade: "desc" },
        take: 1,
        select: { id: true, arquivoUrl: true },
      },
    },
    orderBy: { usuario: { createdAt: "desc" } },
  });

  const comSignedUrls = await Promise.all(
    data.map(async (aluno) => {
      const carteirinha = aluno.carteirinhas[0];
      if (!carteirinha?.arquivoUrl) return { ...aluno, carteirinha_url: null };
      const signedUrl = await getSignedUrl(carteirinha.arquivoUrl, 60 * 10).catch(() => null);
      return { ...aluno, carteirinha_url: signedUrl };
    })
  );

  return comSignedUrls;
}

export async function listPendingRequests() {
  const data = await prisma.aluno.findMany({
    where: { statusCadastro: "pendente" },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, createdAt: true },
      },
      curso: INCLUDE_CURSO_NOME.curso,
    },
    orderBy: { usuario: { createdAt: "desc" } },
  });

  return data;
}

export async function approveSignupRequest(id, userId) {
  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: id },
    include: { usuario: true },
  });

  if (!aluno) throw new Error("Requisição não encontrada");
  if (aluno.statusCadastro !== "pendente")
    throw new Error("Requisição já foi processada");

  const [updatedAluno] = await prisma.$transaction([
    prisma.aluno.update({
      where: { usuarioId: id },
      data: { statusCadastro: "ativo" },
    }),
    prisma.usuario.update({
      where: { id },
      data: { status: "ativo" },
    }),
    prisma.cadastroHistorico.create({
      data: {
        alunoId: id,
        statusAnterior: "pendente",
        statusNovo: "ativo",
        origem: "admin",
        alteradoPorId: userId,
        motivo: "Aprovado pelo administrador",
      },
    }),
  ]);

  let carteirinha = null;
  try {
    carteirinha = await gerarCarteirinha(id, userId);
    notifySignupApproved(aluno.telegramId, aluno.usuario.nome);
  } catch (err) {
    logger.error({ err, usuarioId: id }, 'Erro ao gerar carteirinha na aprovação — aluno aprovado');
  }

  return { usuario: aluno.usuario, aluno: updatedAluno, carteirinha };
}

export async function reproveSignupRequest(id) {
  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: id },
    include: { usuario: INCLUDE_USUARIO_NOME.usuario },
  });

  if (!aluno) throw new Error("Requisição não encontrada");

  const [updatedAluno] = await prisma.$transaction([
    prisma.aluno.update({
      where: { usuarioId: id },
      data: { statusCadastro: "reprovado" },
    }),
    prisma.cadastroHistorico.create({
      data: {
        alunoId: id,
        statusAnterior: aluno.statusCadastro,
        statusNovo: "reprovado",
        origem: "admin",
        motivo: "Reprovado pelo administrador",
      },
    }),
  ]);

  notifySignupReproved(aluno.telegramId, aluno.usuario?.nome);

  return { aluno: updatedAluno };
}

export async function listRequestsPaginated({ status, limit = 10, offset = 0 }) {
  const where = {};
  if (status) where.statusCadastro = status;

  const [data, total] = await Promise.all([
    prisma.aluno.findMany({
      where,
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, createdAt: true },
        },
        curso: INCLUDE_CURSO_NOME.curso,
      },
      orderBy: { usuario: { createdAt: "desc" } },
      skip: offset,
      take: limit,
    }),
    prisma.aluno.count({ where }),
  ]);

  return { data, total };
}

export async function getRequestById(id) {
  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: id },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, tipo: true, status: true },
      },
      curso: {
        include: {
          faculdade: { select: { id: true, nome: true } },
        },
      },
    },
  });

  if (!aluno) throw new Error("Requisição não encontrada");

  const result = {
    ...aluno.usuario,
    ...aluno,
    usuario: undefined,
  };

  const urlsToSign = ['comprovanteResidenciaUrl', 'comprovanteMatriculaUrl', 'fotoUrl']
    .filter(k => result[k])
    .map(k => result[k])

  const signedUrls = urlsToSign.length
    ? await Promise.all(urlsToSign.map(url => getSignedUrl(url, 60 * 60).catch(() => null)))
    : []

  const urlKeys = ['comprovanteResidenciaUrl', 'comprovanteMatriculaUrl', 'fotoUrl'].filter(k => result[k])
  urlKeys.forEach((key, i) => { result[key] = signedUrls[i] })

  return result;
}

export async function approveReenvioRequest(id) {
  const reqData = await prisma.aluno.findUnique({
    where: { usuarioId: id },
    include: { usuario: INCLUDE_USUARIO_NOME.usuario },
  });

  if (!reqData) throw new Error("Reenvio não encontrado");
  if (reqData.statusCadastro !== "pendente")
    throw new Error("Requisição já foi processada");

  const [aluno] = await prisma.$transaction([
    prisma.aluno.update({
      where: { usuarioId: id },
      data: { statusCadastro: "ativo" },
    }),
    prisma.usuario.update({
      where: { id },
      data: { status: "ativo" },
    }),
  ]);

  notifyReenvioApproved(reqData.telegramId, reqData.usuario?.nome);

  return { aluno };
}

export async function obterMeuPerfil(id) {
  const aluno = await prisma.aluno.findUnique({
    where: { usuarioId: id },
    include: {
      usuario: {
        select: { id: true, nome: true, email: true, tipo: true, status: true },
      },
      curso: {
        include: {
          faculdade: { select: { id: true, nome: true } },
        },
      },
    },
  });

  if (!aluno) throw new Error("Aluno não encontrado");

  return {
    ...aluno.usuario,
    ...aluno,
    usuario: undefined,
  };
}
