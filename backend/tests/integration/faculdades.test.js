import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Faculdades Integration Tests', () => {
  let app;
  let testData;
  let faculdadeId;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/faculdades', () => {
    it('deve listar faculdades sem autenticação', async () => {
      const res = await request(app).get('/api/faculdades');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deve incluir a faculdade do seed', async () => {
      const res = await request(app).get('/api/faculdades');
      expect(res.body.some(f => f.id === testData.faculdade.id)).toBe(true);
    });
  });

  describe('GET /api/faculdades/faculdade/:nome', () => {
    it('deve buscar faculdade por nome', async () => {
      // Create a faculdade with unique name to avoid collisions with stale data
      const uid = Date.now();
      const createRes = await request(app)
        .post('/api/faculdades')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: `Faculdade Busca ${uid}`, endereco: `Rua ${uid}, 123` });
      if (createRes.status !== 201) return;

      const res = await request(app).get(`/api/faculdades/faculdade/Faculdade Busca ${uid}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', createRes.body.id);
    });
  });

  describe('GET /api/faculdades/:id', () => {
    it('deve retornar faculdade por ID', async () => {
      const res = await request(app).get(`/api/faculdades/${testData.faculdade.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testData.faculdade.id);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app).get('/api/faculdades/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/faculdades (admin)', () => {
    it('deve criar faculdade como admin', async () => {
      const uid = Date.now();
      const res = await request(app)
        .post('/api/faculdades')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: `Faculdade Test ${uid}`, endereco: `Endereco ${uid}, 123` });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      faculdadeId = res.body.id;
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).post('/api/faculdades').send({ nome: 'Teste', endereco: 'Rua Teste, 123' });
      expect(res.status).toBe(401);
    });

    it('deve rejeitar nome vazio', async () => {
      const res = await request(app).post('/api/faculdades').set('Authorization', `Bearer ${adminToken()}`).send({ endereco: 'Rua Teste, 123' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/faculdades/:id (admin)', () => {
    it('deve atualizar faculdade', async () => {
      if (!faculdadeId) return;
      const res = await request(app)
        .put(`/api/faculdades/${faculdadeId}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Faculdade Atualizada' });

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/faculdades/:id (admin)', () => {
    it('deve alterar status da faculdade', async () => {
      if (!faculdadeId) return;
      const res = await request(app)
        .patch(`/api/faculdades/${faculdadeId}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(200);
    });
  });
});
