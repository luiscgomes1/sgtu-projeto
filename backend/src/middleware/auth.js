import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Verifique o .env');
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token ausente' });

    const payload = jwt.verify(token, JWT_SECRET);

    const user = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, tipo: true, status: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (user.status === 'inativo') {
      return res.status(401).json({ error: 'Conta desativada' });
    }

    req.user = { id: user.id, email: user.email, tipo: user.tipo };
    return next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return next(err);
  }
}

// middleware para checar papel (admin)
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (req.user.tipo !== role) return res.status(403).json({ error: 'Acesso negado' });
    next();
  };
}

export function requireBotAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({ error: 'Token ausente' });

  const token = authHeader.replace('Bearer ', '');
  if(token !== process.env.API_KEY) return res.status(403).json({ error: 'Acesso negado' });

  next();
}