import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;
const BOT_JWT_EXPIRES_IN = process.env.BOT_JWT_EXPIRES_IN || '1h';

export async function generateBotTokenForTelegramId(telegramId, options = {}) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET não está definido');

  const data = await prisma.aluno.findFirst({
    where: { telegramId },
    include: {
      usuario: {
        select: { nome: true, tipo: true, email: true, status: true },
      },
    },
  });

  if (!data) return null;

  const payload = {
    id: data.usuarioId,
    nome: data.usuario.nome,
    email: data.usuario.email,
    tipo: data.usuario.tipo,
    scope: options.scope || ['presenca', 'carteirinha'],
    aud: 'bot',
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: BOT_JWT_EXPIRES_IN });

  return { token, user: { id: data.usuarioId, nome: data.usuario.nome, email: data.usuario.email } };
}

export async function generateBotTokenForUserId(userId, options = {}) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET não está definido');

  const data = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!data) return null;

  const payload = {
    id: data.id,
    nome: data.nome,
    email: data.email,
    tipo: data.tipo,
    scope: options.scope || ['presenca', 'carteirinha'],
    aud: 'bot',
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: BOT_JWT_EXPIRES_IN });
  return { token, user: { id: data.id, nome: data.nome, email: data.email } };
}
