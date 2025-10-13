export function notFound(req, res, next) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  // Erros de validação (Joi/Yup)
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, details: err.details });
  }

  // Erros de autenticação/autorização
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const status = err.status || 500;
  const response = { error: err.message || 'Erro interno' };

  // Stack trace só em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}
