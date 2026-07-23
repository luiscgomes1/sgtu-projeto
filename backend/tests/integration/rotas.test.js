import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Rotas Integration Tests', () => {
  let app;
  let testData;
  let rotaId;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/rotas', () => {
    it('deve listar rotas como admin', async () => {
      const res = await request(app)
        .get('/api/rotas')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get('/api/rotas');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/rotas (admin)', () => {
    it('deve criar rota como admin', async () => {
      const uid = Date.now();
      const res = await request(app)
        .post('/api/rotas')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: `Rota Test ${uid}` });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      rotaId = res.body.id;
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).post('/api/rotas').send({ nome: 'Teste' });
      expect(res.status).toBe(401);
    });

    it('deve rejeitar non-admin', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign({ id: '00000000-0000-0000-0000-000000000000', tipo: 'aluno' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });
      const res = await request(app).post('/api/rotas').set('Authorization', `Bearer ${token}`).send({ nome: 'Teste' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/rotas/:id', () => {
    it('deve retornar rota por ID', async () => {
      const res = await request(app)
        .get(`/api/rotas/${testData.rota.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testData.rota.id);
    });

    it('deve retornar null para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/rotas/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toBeNull();
    });
  });

  describe('PUT /api/rotas/:id (admin)', () => {
    it('deve atualizar rota', async () => {
      if (!rotaId) return;
      const res = await request(app)
        .put(`/api/rotas/${rotaId}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Rota Atualizada' });

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/rotas/:id/status (admin)', () => {
    it('deve alterar status da rota', async () => {
      if (!rotaId) return;
      const res = await request(app)
        .patch(`/api/rotas/${rotaId}/status`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(200);
    });
  });
});
