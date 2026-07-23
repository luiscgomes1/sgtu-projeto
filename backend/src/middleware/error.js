import { logger } from '../config/logger.js';

function isPrismaError(err) {
  return err.constructor?.name === 'PrismaClientKnownRequestError';
}

export function notFound(req, res, next) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    logger.error({ err, status }, 'Erro interno do servidor');
  } else {
    logger.warn({ err, status }, 'Erro na requisição');
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, details: err.details });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  if (isPrismaError(err)) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Registro duplicado. Já existe um recurso com esse valor único.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro não encontrado para atualizar ou excluir.' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Violação de chave estrangeira. O recurso referenciado não existe.' });
    }
    if (err.code === 'P2014') {
      return res.status(400).json({ error: 'Violação de relação. A operação quebraria uma restrição de integridade.' });
    }
    return res.status(400).json({ error: 'Erro no banco de dados' });
  }

  const isDev = process.env.NODE_ENV === 'development';
  const response = {
    error: isDev ? err.message : (status >= 500 ? 'Erro interno do servidor' : err.message),
  };
  if (isDev) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}
