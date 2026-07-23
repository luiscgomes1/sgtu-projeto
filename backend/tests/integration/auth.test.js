import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Auth Integration Tests', () => {
  let app;
  let testData;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', { timeout: 30000 }, async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@sgtu.com', senha: '123456' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'admin@sgtu.com');
    });

    it('deve rejeitar senha incorreta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@sgtu.com', senha: 'senha_errada' });

      expect(res.status).toBe(401);
    });

    it('deve rejeitar email inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'naoexiste@teste.com', senha: '123456' });

      expect(res.status).toBe(401);
    });

    it('deve rejeitar email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalido', senha: '123456' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('details');
    });

    it('deve rejeitar senha muito curta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@sgtu.com', senha: '12' });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar campos ausentes', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('deve encerrar sessão (sem body)', { timeout: 30000 }, async () => {
      const res = await request(app).post('/api/auth/logout').send({});

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('deve encerrar sessão com refresh token', { timeout: 30000 }, async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@sgtu.com', senha: '123456' });

      const res = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: loginRes.body.refreshToken });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('deve renovar token com refresh token válido', { timeout: 30000 }, async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@sgtu.com', senha: '123456' });

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: loginRes.body.refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('deve rejeitar refresh token inválido', { timeout: 30000 }, async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'token-invalido' });

      expect(res.status).toBe(401);
    });

    it('deve rejeitar refresh token vazio', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/usuario/me (auth required)', () => {
    it('deve retornar dados do usuário autenticado', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign(
        { id: testData.admin.id, email: 'admin@sgtu.com', tipo: 'admin' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/usuario/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', 'admin@sgtu.com');
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get('/api/usuario/me');

      expect(res.status).toBe(401);
    });

    it('deve rejeitar token inválido', async () => {
      const res = await request(app)
        .get('/api/usuario/me')
        .set('Authorization', 'Bearer token-invalido');

      expect(res.status).toBe(401);
    });

    it('deve rejeitar token expirado', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const expiredToken = jwt.sign(
        { id: testData.admin.id, email: 'admin@sgtu.com', tipo: 'admin' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '0s' }
      );

      const res = await request(app)
        .get('/api/usuario/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });
  });

  describe('Role-based access', () => {
    it('deve permitir admin acessar rota de admin', async () => {
      const uid = Date.now();
      const res = await request(app)
        .post('/api/faculdades')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: `Faculdade Role ${uid}`, endereco: `Endereco Role ${uid}, 999` });

      expect(res.status).toBe(201);
    });

    it('deve negar acesso sem token em rota admin', async () => {
      const res = await request(app)
        .post('/api/faculdades')
        .send({ nome: 'Teste', endereco: 'Rua Teste, 123' });

      expect(res.status).toBe(401);
    });

    it('deve negar acesso de non-admin a rota admin', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const { prisma } = await import('../helpers/seed.js');
      const jwt = (await import('jsonwebtoken')).default;

      const aluno = await prisma.usuario.create({
        data: {
          nome: 'Aluno Teste Role',
          email: `aluno_role_${Date.now()}@teste.com`,
          senhaHash: await bcrypt.hash('123456', 10),
          tipo: 'aluno',
          status: 'ativo',
        },
      });

      const token = jwt.sign(
        { id: aluno.id, email: aluno.email, tipo: 'aluno' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .post('/api/faculdades')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Teste Aluno', endereco: 'Rua do Aluno, 123' });

      expect(res.status).toBe(403);
    });
  });
});
