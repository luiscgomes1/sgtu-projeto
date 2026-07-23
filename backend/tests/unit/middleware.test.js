import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/config/prisma.js', () => ({
  prisma: {
    usuario: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Auth middleware (unit)', () => {
  describe('requireAuth', () => {
    it('deve rejeitar sem token', async () => {
      const { requireAuth } = await import('../../src/middleware/auth.js');
      const req = { headers: {}, cookies: {} };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token ausente' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar com Authorization vazio', async () => {
      const { requireAuth } = await import('../../src/middleware/auth.js');
      const req = { headers: { authorization: '' }, cookies: {} };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve rejeitar token mal formatado', async () => {
      const { requireAuth } = await import('../../src/middleware/auth.js');
      const req = { headers: { authorization: 'Bearer token-invalido' }, cookies: {} };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    });

    it('deve aceitar token válido com usuário ativo', async () => {
      const { prisma } = await import('../../src/config/prisma.js');
      prisma.usuario.findUnique.mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@test.com',
        tipo: 'admin',
        status: 'ativo',
      });

      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign(
        { id: '00000000-0000-0000-0000-000000000000', email: 'test@test.com', tipo: 'admin' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '1h' }
      );

      const { requireAuth } = await import('../../src/middleware/auth.js');
      const req = { headers: {}, cookies: { jwt: token } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      await requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe('test@test.com');
    });

    it('deve rejeitar token de usuário inativo', async () => {
      const { prisma } = await import('../../src/config/prisma.js');
      prisma.usuario.findUnique.mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'inativo@test.com',
        tipo: 'admin',
        status: 'inativo',
      });

      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign(
        { id: '00000000-0000-0000-0000-000000000000', email: 'inativo@test.com', tipo: 'admin' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '1h' }
      );

      const { requireAuth } = await import('../../src/middleware/auth.js');
      const req = { headers: {}, cookies: { jwt: token } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Conta desativada' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar token de usuário inexistente', async () => {
      const { prisma } = await import('../../src/config/prisma.js');
      prisma.usuario.findUnique.mockResolvedValue(null);

      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign(
        { id: '00000000-0000-0000-0000-000000000000', email: 'ghost@test.com', tipo: 'admin' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '1h' }
      );

      const { requireAuth } = await import('../../src/middleware/auth.js');
      const req = { headers: {}, cookies: { jwt: token } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('deve permitir admin em rota admin', async () => {
      const { requireRole } = await import('../../src/middleware/auth.js');
      const req = { user: { tipo: 'admin' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      requireRole('admin')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('deve negar aluno em rota admin', async () => {
      const { requireRole } = await import('../../src/middleware/auth.js');
      const req = { user: { tipo: 'aluno' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      requireRole('admin')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Acesso negado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve rejeitar se req.user não existir', async () => {
      const { requireRole } = await import('../../src/middleware/auth.js');
      const req = {};
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      requireRole('admin')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requireBotAuth', () => {
    it('deve rejeitar sem header', async () => {
      const { requireBotAuth } = await import('../../src/middleware/auth.js');
      const req = { headers: {} };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      requireBotAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve rejeitar API_KEY incorreta', async () => {
      const { requireBotAuth } = await import('../../src/middleware/auth.js');
      const req = { headers: { authorization: 'Bearer chave-errada' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      requireBotAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});

describe('Validate middleware (unit)', () => {
  it('deve passar na validação de body', async () => {
    const { validate } = await import('../../src/middleware/validate.js');
    const { z } = await import('zod');

    const schema = z.object({ nome: z.string().min(1) });
    const req = { body: { nome: 'Teste' }, params: {}, query: {} };
    const res = {};
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ nome: 'Teste' });
  });

  it('deve falhar na validação de body', async () => {
    const { validate } = await import('../../src/middleware/validate.js');
    const { z } = await import('zod');

    const schema = z.object({ nome: z.string().min(3) });
    const req = { body: { nome: 'ab' }, params: {}, query: {} };
    const res = {};
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'ValidationError',
        status: 400,
      })
    );
  });

  it('deve validar params', async () => {
    const { validate } = await import('../../src/middleware/validate.js');
    const { z } = await import('zod');

    const schema = z.object({ id: z.string().uuid() });
    const req = { body: {}, params: { id: 'invalido' }, query: {} };
    const res = {};
    const next = vi.fn();

    validate(schema, 'params')(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ValidationError' })
    );
  });

  it('deve validar query', async () => {
    const { validate } = await import('../../src/middleware/validate.js');
    const { z } = await import('zod');

    const schema = z.object({ page: z.coerce.number().int().min(1) });
    const req = { body: {}, params: {}, query: { page: 'abc' } };
    const res = {};
    const next = vi.fn();

    validate(schema, 'query')(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ValidationError' })
    );
  });

  it('deve passar com query válida', async () => {
    const { validate } = await import('../../src/middleware/validate.js');
    const { z } = await import('zod');

    const schema = z.object({ page: z.coerce.number().int().min(1).default(1) });
    const req = { body: {}, params: {}, query: { page: '2' } };
    const res = {};
    const next = vi.fn();

    validate(schema, 'query')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('deve aplicar defaults do schema no body', async () => {
    const { validate } = await import('../../src/middleware/validate.js');
    const { z } = await import('zod');

    const schema = z.object({ nome: z.string().default('default') });
    const req = { body: {}, params: {}, query: {} };
    const res = {};
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ nome: 'default' });
  });
});

describe('Sanitize middleware (unit)', () => {
  it('deve limpar CPF (remover máscara)', async () => {
    const { sanitizeData } = await import('../../src/middleware/sanitize.js');
    const req = { body: { cpf: '123.456.789-01' } };
    const next = vi.fn();

    sanitizeData(req, {}, next);

    expect(req.body.cpf).toBe('12345678901');
    expect(next).toHaveBeenCalled();
  });

  it('deve limpar telefone (remover máscara)', async () => {
    const { sanitizeData } = await import('../../src/middleware/sanitize.js');
    const req = { body: { telefone: '(11) 99999-9999' } };
    const next = vi.fn();

    sanitizeData(req, {}, next);

    expect(req.body.telefone).toBe('11999999999');
    expect(next).toHaveBeenCalled();
  });

  it('deve limpar nome (trim + espaços)', async () => {
    const { sanitizeData } = await import('../../src/middleware/sanitize.js');
    const req = { body: { nome: '  João   Silva  ' } };
    const next = vi.fn();

    sanitizeData(req, {}, next);

    expect(req.body.nome).toBe('João Silva');
    expect(next).toHaveBeenCalled();
  });

  it('deve limpar email (trim)', async () => {
    const { sanitizeData } = await import('../../src/middleware/sanitize.js');
    const req = { body: { email: '  teste@email.com  ' } };
    const next = vi.fn();

    sanitizeData(req, {}, next);

    expect(req.body.email).toBe('teste@email.com');
    expect(next).toHaveBeenCalled();
  });

  it('deve limpar RG (remover <>)', async () => {
    const { sanitizeData } = await import('../../src/middleware/sanitize.js');
    const req = { body: { rg: '12.345.678-9' } };
    const next = vi.fn();

    sanitizeData(req, {}, next);

    expect(req.body.rg).toBe('12.345.678-9');
    expect(next).toHaveBeenCalled();
  });

  it('deve passar sem body', async () => {
    const { sanitizeData } = await import('../../src/middleware/sanitize.js');
    const req = {};
    const next = vi.fn();

    sanitizeData(req, {}, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('Error handler (unit)', () => {
  it('deve retornar 400 para ValidationError', async () => {
    const { errorHandler } = await import('../../src/middleware/error.js');
    const err = new Error('Erro de validação');
    err.name = 'ValidationError';
    err.details = ['nome: obrigatório'];
    err.status = 400;

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    errorHandler(err, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Erro de validação', details: ['nome: obrigatório'] })
    );
  });

  it('deve retornar 401 para UnauthorizedError', async () => {
    const { errorHandler } = await import('../../src/middleware/error.js');
    const err = new Error('Não autorizado');
    err.name = 'UnauthorizedError';

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    errorHandler(err, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('deve retornar 403 para ForbiddenError', async () => {
    const { errorHandler } = await import('../../src/middleware/error.js');
    const err = new Error('Acesso negado');
    err.name = 'ForbiddenError';

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    errorHandler(err, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deve retornar 404 para notFound', async () => {
    const { notFound } = await import('../../src/middleware/error.js');
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    notFound({}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Rota não encontrada' });
  });

  it('deve retornar 500 como fallback', async () => {
    const { errorHandler } = await import('../../src/middleware/error.js');
    const err = new Error('Erro interno');
    err.status = 500;

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    errorHandler(err, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Erro interno' })
    );
  });
});
