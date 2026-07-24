import { randomUUID } from 'crypto';
import { prisma } from "../../config/prisma.js";
import { uploadFile, getSignedUrl } from "../../config/storage.js";
import { gerarCarteirinhaBuffer } from "./pdf.service.js";
import { truncDate } from "../../utils/functions.js";
import { INCLUDE_FACULDADE } from '../../shared/includes.js';

export async function gerarCarteirinha(alunoId, criadoPor) {
  const [[admin, usuarioData, aluno], config] = await Promise.all([
    Promise.all([
      prisma.usuario.findUnique({ where: { id: criadoPor }, select: { id: true, tipo: true } }),
      prisma.usuario.findUnique({ where: { id: alunoId }, select: { id: true, nome: true, email: true } }),
      prisma.aluno.findUnique({ where: { usuarioId: alunoId } }),
    ]),
    prisma.configuracao.findUnique({ where: { id: 1 } }),
  ]);

  if (!admin || admin.tipo !== "admin") throw new Error("Apenas administradores podem gerar carteirinhas.");
  if (!usuarioData) throw new Error("Usuário não encontrado");
  if (!aluno) throw new Error("Aluno não encontrado ou não aprovado.");

  let cursoData = null;
  if (aluno.cursoId) {
    const curso = await prisma.curso.findUnique({
      where: { id: aluno.cursoId },
      include: INCLUDE_FACULDADE,
    });
    if (curso) {
      cursoData = {
        nome: curso.nome,
        faculdade_nome: curso.faculdade?.nome,
      };
    }
  }
  const configData = {
    logoUrl: config?.logoUrl || null,
    nomeOrganizacao: config?.nomeOrganizacao || null,
  };

  const token = randomUUID();
  const validade = new Date();
  validade.setFullYear(validade.getFullYear() + 1);
  const validityStr = truncDate(validade);

  const created = await prisma.carteirinha.create({
    data: {
      alunoId,
      dataValidade: new Date(validade),
      qrcodeToken: token,
      criadoPorId: criadoPor,
    },
  });

  const alunoData = {
    usuario_id: alunoId,
    nome: usuarioData.nome,
    rg: aluno.rg,
    cpf: aluno.cpf,
    data_nascimento: aluno.dataNascimento,
    telefone: aluno.telefone,
    tipo_sanguineo: aluno.tipoSanguineo,
    foto_url: aluno.fotoUrl,
  };
  const carteirinhaData = {
    qrcode_token: token,
    data_validade: validityStr,
  };
  const pdfBuffer = await gerarCarteirinhaBuffer(alunoData, admin, cursoData, carteirinhaData, configData);

  const filePath = `carteirinhas/${alunoId}/${created.id}.pdf`;
  await uploadFile(filePath, pdfBuffer, "application/pdf");
  await prisma.carteirinha.update({
    where: { id: created.id },
    data: { arquivoUrl: filePath },
  });
  const signedUrl = await getSignedUrl(filePath, 60 * 10);

  return { signedUrl, validade: validityStr, message: "Carteirinha gerada com sucesso" };
}

export async function obterCarteirinhaAtiva(alunoId, requester) {
  if (requester.tipo !== "admin" && requester.id !== alunoId) {
    throw new Error("Acesso negado");
  }

  const hoje = truncDate();

  const data = await prisma.carteirinha.findFirst({
    where: {
      alunoId,
      dataValidade: { gte: new Date(hoje) },
    },
    orderBy: { dataValidade: "desc" },
  });

  if (!data) throw new Error("Nenhuma carteirinha válida encontrada");

  let signedUrl = null;
  if (data.arquivoUrl) {
    signedUrl = await getSignedUrl(data.arquivoUrl, 60 * 10);
  }

  return {
    ...data,
    signedUrl,
  };
}

const CARTEIRINHA_LIST_SELECT = {
  id: true, alunoId: true, dataValidade: true, arquivoUrl: true,
  criadoPorId: true, criadoEm: true, atualizadoEm: true,
};

export async function listarCarteirinhas(alunoId, requester) {
  if (requester.tipo !== "admin" && requester.id !== alunoId) {
    throw new Error("Acesso negado");
  }

  const hoje = truncDate();

  const data = await prisma.carteirinha.findMany({
    where: {
      alunoId,
      dataValidade: { gte: new Date(hoje) },
    },
    select: CARTEIRINHA_LIST_SELECT,
    orderBy: { dataValidade: "desc" },
  });

  if (!data || data.length === 0) throw new Error("Nenhuma carteirinha válida encontrada");

  const comSignedUrls = await Promise.all(
    data.map(async (carteirinha) => {
      if (!carteirinha.arquivoUrl) return { ...carteirinha, signedUrl: null };
      const signedUrl = await getSignedUrl(carteirinha.arquivoUrl, 60 * 10);
      return { ...carteirinha, signedUrl };
    })
  );

  return comSignedUrls;
}

export async function validarQRCode(token) {
  const hoje = truncDate();

  const carteirinha = await prisma.carteirinha.findUnique({
    where: { qrcodeToken: token },
  });

  if (!carteirinha) {
    const invalid = new Error("Qr Code ou carteirinha inválida.");
    invalid.name = "UnauthorizedError";
    throw invalid;
  }

  if (truncDate(carteirinha.dataValidade) < hoje) {
    throw new Error("Carteirinha está expirada.");
  }

  return carteirinha.alunoId;
}

export async function gerarPreviewBuffer(alunoId) {
  const [usuario, aluno, config] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: alunoId } }),
    prisma.aluno.findUnique({ where: { usuarioId: alunoId } }),
    prisma.configuracao.findUnique({ where: { id: 1 } }),
  ]);
  if (!usuario || !aluno) return null;

  let cursoData = null;
  if (aluno.cursoId) {
    const curso = await prisma.curso.findUnique({
      where: { id: aluno.cursoId },
      include: INCLUDE_FACULDADE,
    });
    if (curso) {
      cursoData = { nome: curso.nome, faculdade_nome: curso.faculdade?.nome };
    }
  }
  const configData = {
    logoUrl: config?.logoUrl || null,
    nomeOrganizacao: config?.nomeOrganizacao || null,
  };

  const admin = { nome: 'Preview' };
  const token = randomUUID();
  const validade = new Date();
  validade.setFullYear(validade.getFullYear() + 1);

  const alunoData = {
    usuario_id: alunoId, nome: usuario.nome, rg: aluno.rg,
    cpf: aluno.cpf, data_nascimento: aluno.dataNascimento,
    telefone: aluno.telefone, tipo_sanguineo: aluno.tipoSanguineo,
    foto_url: aluno.fotoUrl,
  };
  const carteirinhaData = {
    qrcode_token: token,
    data_validade: truncDate(validade),
  };

  return gerarCarteirinhaBuffer(alunoData, admin, cursoData, carteirinhaData, configData);
}

export async function gerarPreviewMock() {
  const mockAluno = {
    usuario_id: '00000000-0000-0000-0000-000000000000',
    nome: 'MARIA DA SILVA OLIVEIRA',
    rg: 'MG-12.345.678',
    cpf: '12345678901',
    data_nascimento: '2005-03-15',
    telefone: '34991234567',
    tipo_sanguineo: 'O+',
    foto_url: null,
  };
  const mockAdmin = { nome: 'Administrador Mock' };
  const mockCurso = { nome: 'ENGENHARIA DE SOFTWARE', faculdade_nome: 'FACULDADE DE EDUCAÇÃO DE PIRAJUBA' };
  const mockCarteirinha = {
    qrcode_token: 'mock-qrcode-token-para-teste',
    data_validade: '2027-12-31',
  };
  const mockConfig = {
    logoUrl: null,
    nomeOrganizacao: 'PREFEITURA MUNICIPAL DE PIRAJUBA',
  };

  return gerarCarteirinhaBuffer(mockAluno, mockAdmin, mockCurso, mockCarteirinha, mockConfig);
}
