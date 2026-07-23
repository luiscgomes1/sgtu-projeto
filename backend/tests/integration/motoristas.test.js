import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Motoristas Integration Tests', () => {
  let app;
  let testData;
  let motoristaId;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/motoristas', () => {
    it('deve listar motoristas como admin', async () => {
      const res = await request(app)
        .get('/api/motoristas')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deve listar com incluirInativos', async () => {
      const res = await request(app)
        .get('/api/motoristas?incluirInativos=true')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get('/api/motoristas');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/motoristas (admin)', () => {
    it('deve criar motorista como admin', async () => {
      const uid = Date.now();
      const res = await request(app)
        .post('/api/motoristas')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          nome: `Motorista Test ${uid}`,
          cpf: `${uid.toString().slice(0, 11).padStart(11, '0')}`,
          cnh: `${uid.toString().slice(0, 11).padStart(11, '0')}`,
          data_nascimento: '1990-01-15',
          validade_cnh: '2030-12-31',
          telefone: '(34) 90000-0000',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      motoristaId = res.body.id;
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).post('/api/motoristas').send({ nome: 'Teste', cpf: '12345678901', cnh: '12345678901' });
      expect(res.status).toBe(401);
    });

    it('deve rejeitar non-admin', async () => {
      const res = await request(app).post('/api/motoristas').send({ nome: 'Teste', cpf: '12345678901', cnh: '12345678901' });
      expect(res.status).toBe(401);
    });

    it('deve rejeitar dados incompletos', async () => {
      const res = await request(app).post('/api/motoristas').set('Authorization', `Bearer ${adminToken()}`).send({ nome: 'Teste' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/motoristas/:id', () => {
    it('deve retornar motorista por ID', async () => {
      const res = await request(app)
        .get(`/api/motoristas/${testData.motorista.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testData.motorista.id);
    });

    it('deve retornar null para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/motoristas/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toBeNull();
    });
  });

  describe('PUT /api/motoristas/:id (admin)', () => {
    it('deve atualizar motorista', async () => {
      if (!motoristaId) return;
      const res = await request(app)
        .put(`/api/motoristas/${motoristaId}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Motorista Atualizado' });

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/motoristas/:id/status (admin)', () => {
    it('deve alterar status do motorista', async () => {
      if (!motoristaId) return;
      const res = await request(app)
        .patch(`/api/motoristas/${motoristaId}/status`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(200);
    });
  });
});
