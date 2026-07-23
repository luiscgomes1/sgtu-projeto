import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Pontos Integration Tests', () => {
  let app;
  let testData;
  let pontoId;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/pontos', () => {
    it('deve listar pontos sem autenticação', async () => {
      const res = await request(app).get('/api/pontos');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/pontos (admin)', () => {
    it('deve criar ponto como admin', async () => {
      const uid = Date.now();
      const res = await request(app)
        .post('/api/pontos')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: `Ponto Test ${uid}`, endereco: `Rua ${uid}, 123` });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      pontoId = res.body.id;
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).post('/api/pontos').send({ nome: 'Teste', endereco: 'Rua Teste, 123' });
      expect(res.status).toBe(401);
    });

    it('deve rejeitar non-admin', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign({ id: '00000000-0000-0000-0000-000000000000', tipo: 'aluno' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });
      const res = await request(app).post('/api/pontos').set('Authorization', `Bearer ${token}`).send({ nome: 'Teste', endereco: 'Rua Teste, 123' });
      expect(res.status).toBe(401);
    });

    it('deve rejeitar nome vazio', async () => {
      const res = await request(app).post('/api/pontos').set('Authorization', `Bearer ${adminToken()}`).send({ endereco: 'Rua Teste, 123' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/pontos/detalhe/:id', () => {
    it('deve retornar ponto por ID', async () => {
      const res = await request(app)
        .get(`/api/pontos/detalhe/${testData.ponto.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testData.ponto.id);
    });

    it('deve rejeitar UUID inválido', async () => {
      const res = await request(app)
        .get('/api/pontos/detalhe/invalido')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/pontos/:id (admin)', () => {
    it('deve atualizar ponto', async () => {
      if (!pontoId) return;
      const res = await request(app)
        .put(`/api/pontos/${pontoId}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Ponto Atualizado' });

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/pontos/:id/status (admin)', () => {
    it('deve alterar status do ponto', async () => {
      if (!pontoId) return;
      const res = await request(app)
        .patch(`/api/pontos/${pontoId}/status`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(200);
    });
  });
});
