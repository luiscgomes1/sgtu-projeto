import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// middleware que valida JWT (para usuários do nosso "usuarios" table)
export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    let token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if(!token && req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) return res.status(401).json({ error: 'Token ausente' });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email, tipo, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
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