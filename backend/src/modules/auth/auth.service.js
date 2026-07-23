import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { generateTokens } from "./refreshToken.service.js";
import { INCLUDE_FACULDADE } from "../../shared/includes.js";

export async function login({ email, senha }) {
  const user = await prisma.usuario.findUnique({
    where: { email },
    include: {
      aluno: {
        include: {
          curso: {
            include: INCLUDE_FACULDADE,
          },
        },
      },
    },
  });

  if (!user || user.status !== "ativo") {
    const unauthorized = new Error("Usuário não encontrado ou senha inválida");
    unauthorized.name = "UnauthorizedError";
    throw unauthorized;
  }

  const isValid = await bcrypt.compare(senha, user.senhaHash);
  if (!isValid) {
    const unauthorized = new Error("Usuário não encontrado ou senha inválida");
    unauthorized.name = "UnauthorizedError";
    throw unauthorized;
  }

  const { accessToken, refreshToken, expiresAt } = await generateTokens(user);

  return {
    accessToken,
    refreshToken,
    expiresAt,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      status: user.status,
      ...(user.aluno && {
        rg: user.aluno.rg,
        telefone: user.aluno.telefone,
        dataNascimento: user.aluno.dataNascimento,
        tipoSanguineo: user.aluno.tipoSanguineo,
        cursoId: user.aluno.cursoId,
        cursoNome: user.aluno.curso?.nome,
        faculdadeId: user.aluno.curso?.faculdadeId,
        faculdadeNome: user.aluno.curso?.faculdade?.nome,
        statusCadastro: user.aluno.statusCadastro,
      }),
    },
  };
}
