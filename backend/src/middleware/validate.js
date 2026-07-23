/**
 * Middleware para validar body, params ou query com Zod.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'params'|'query'} [location='body']
 */
export const validate = (schema, location = 'body') => (req, res, next) => {
  const data = req[location];
  const result = schema.safeParse(data);

  if (!result.success) {
    const details = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    const validationError = new Error('Erro de validação');
    validationError.details = details;
    validationError.name = 'ValidationError';
    validationError.status = 400;
    return next(validationError);
  }

  // Substitui req.body com os dados parseados (strip + coerção + defaults).
  // req.params e req.query são read-only no Express v5, então só validamos sem substituir.
  if (location === 'body') {
    req[location] = result.data;
  }

  next();
};
