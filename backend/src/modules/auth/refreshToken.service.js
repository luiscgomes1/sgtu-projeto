import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_DAYS = 7;

export async function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo, status: user.status },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES },
  );

  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { usuarioId: user.id, tokenHash, expiresAt },
  });

  return { accessToken, refreshToken: rawToken, expiresAt };
}

export async function refreshAccessToken(rawToken) {
  // Clean up expired tokens to keep scan space small
  await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const tokens = await prisma.refreshToken.findMany({
    where: {
      revokedAt: null,
      expiresAt: { gte: new Date() },
    },
    include: { usuario: true },
  });

  let matched = null;
  for (const t of tokens) {
    const valid = await bcrypt.compare(rawToken, t.tokenHash);
    if (valid) { matched = t; break; }
  }

  if (!matched) {
    const err = new Error('Refresh token inválido ou expirado');
    err.name = 'UnauthorizedError';
    throw err;
  }

  const user = matched.usuario;
  if (user.status !== 'ativo') {
    await prisma.refreshToken.update({ where: { id: matched.id }, data: { revokedAt: new Date() } });
    const err = new Error('Usuário inativo');
    err.name = 'UnauthorizedError';
    throw err;
  }

  const accessToken = jwt.sign(
    { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo, status: user.status },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES },
  );

  const rawTokenNovo = crypto.randomBytes(40).toString('hex');
  const tokenHash = await bcrypt.hash(rawTokenNovo, 10);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: matched.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({
      data: { usuarioId: user.id, tokenHash, expiresAt },
    }),
  ]);

  return { accessToken, refreshToken: rawTokenNovo, expiresAt };
}

export async function revokeRefreshToken(rawToken) {
  // Clean up expired tokens to keep scan space small
  await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  const tokens = await prisma.refreshToken.findMany({
    where: { revokedAt: null },
  });

  for (const t of tokens) {
    const valid = await bcrypt.compare(rawToken, t.tokenHash);
    if (valid) {
      await prisma.refreshToken.update({ where: { id: t.id }, data: { revokedAt: new Date() } });
      return true;
    }
  }
  return false;
}
