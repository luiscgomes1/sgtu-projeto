import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Cursos Integration Tests', () => {
  let app;
  let testData;
  let cursoId;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/cursos', () => {
    it('deve listar cursos sem autenticação', async () => {
      const res = await request(app).get('/api/cursos');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/cursos (admin)', () => {
    it('deve criar curso como admin', async () => {
      const uid = Date.now();
      const res = await request(app)
        .post('/api/cursos')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: `Curso Test ${uid}`, faculdade_id: testData.faculdade.id });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      cursoId = res.body.id;
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).post('/api/cursos').send({ nome: 'Teste', faculdade_id: testData.faculdade.id });
      expect(res.status).toBe(401);
    });

    it('deve rejeitar non-admin', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const token = jwt.sign({ id: '00000000-0000-0000-0000-000000000000', tipo: 'aluno' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });
      const res = await request(app).post('/api/cursos').set('Authorization', `Bearer ${token}`).send({ nome: 'Teste', faculdade_id: testData.faculdade.id });
      expect(res.status).toBe(401);
    });

    it('deve rejeitar nome vazio', async () => {
      const res = await request(app).post('/api/cursos').set('Authorization', `Bearer ${adminToken()}`).send({ nome: '', faculdade_id: testData.faculdade.id });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/cursos/:id', () => {
    it('deve retornar curso por ID', async () => {
      const res = await request(app).get(`/api/cursos/${testData.curso.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testData.curso.id);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app).get('/api/cursos/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/cursos/:id (admin)', () => {
    it('deve atualizar curso', async () => {
      if (!cursoId) return;
      const res = await request(app)
        .put(`/api/cursos/${cursoId}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Curso Atualizado' });

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Curso Atualizado');
    });
  });

  describe('PATCH /api/cursos/:id (admin)', () => {
    it('deve alterar status do curso', async () => {
      if (!cursoId) return;
      const res = await request(app)
        .patch(`/api/cursos/${cursoId}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(200);
    });
  });
});
