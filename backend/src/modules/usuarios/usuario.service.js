import { prisma } from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import { createTelegramLink } from "../../shared/telegramLinkStore.js";

export async function getUsuarioById(id) {
  const data = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true, tipo: true, status: true, createdAt: true },
  });
  return data;
}

export async function getAlunoProfile(usuarioId) {
  const data = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, nome: true, email: true, tipo: true, status: true, createdAt: true, aluno: true },
  });
  return data;
}

export async function atualizarPerfil(usuarioId, dados) {
  if (!dados.nome) {
    throw new Error("Nome é obrigatório.");
  }

  const data = await prisma.usuario.update({
    where: { id: usuarioId },
    data: { nome: dados.nome },
  });
  return data;
}

export async function validarSenha(usuarioId, senha) {
  if (!senha) return false;
  const user = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: { senhaHash: true } });
  if (!user?.senhaHash) return false;
  return bcrypt.compare(senha, user.senhaHash);
}

export async function alterarSenha(usuarioId, senhaAtual, novaSenha) {
    if (!novaSenha) {
        throw new Error("Senha é obrigatória.");
    }

    if(novaSenha === senhaAtual) throw new Error("A nova senha deve ser diferente da atual.");

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  const data = await prisma.usuario.update({
    where: { id: usuarioId },
    data: { senhaHash },
  });
  return data;
}

export async function gerarTokenTelegram(userId) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, telegramId: true },
  });
  if (!user) throw new Error("Usuário não encontrado");

  const token = createTelegramLink(user.id);
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || "sgtupirajubabot";
  return { token, jaConectado: !!user.telegramId, link: `https://t.me/${botUsername}?start=${token}` };
}

export async function statusTelegram(userId) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { telegramId: true },
  });
  return { conectado: !!user?.telegramId, telegramId: user?.telegramId || null };
}

export async function desconectarTelegram(userId) {
  await prisma.usuario.update({
    where: { id: userId },
    data: { telegramId: null },
  });
  return { message: "Telegram desconectado com sucesso." };
}
