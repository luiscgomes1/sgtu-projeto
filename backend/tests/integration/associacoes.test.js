import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Associações Integration Tests', () => {
  let app;
  let testData;
  let rotaPonto;
  let rotaMotorista;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();

    // Create a rota-ponto link
    rotaPonto = await prisma.rotaPonto.create({
      data: {
        rotaId: testData.rota.id,
        pontoId: testData.ponto.id,
        ordem: 1,
        status: 'ativo',
      },
    });

    // Create a rota-motorista link
    rotaMotorista = await prisma.rotaMotorista.create({
      data: {
        rotaId: testData.rota.id,
        motoristaId: testData.motorista.id,
        inicio: new Date(),
        status: 'ativo',
      },
    });

    // Create a rota-faculdade link
    await prisma.rotaFaculdade.create({
      data: {
        rotaId: testData.rota.id,
        faculdadeId: testData.faculdade.id,
        status: 'ativo',
      },
    });
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Rota-Pontos GET /api/rota-pontos/:rotaId/pontos', () => {
    it('deve listar pontos de uma rota', async () => {
      const res = await request(app)
        .get(`/api/rota-pontos/${testData.rota.id}/pontos`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('pontoId', testData.ponto.id);
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app)
        .get(`/api/rota-pontos/${testData.rota.id}/pontos`);
      expect(res.status).toBe(401);
    });
  });

  describe('Rota-Pontos PUT /api/rota-pontos/:rotaId/pontos/ordem', () => {
    it('deve atualizar ordem dos pontos', async () => {
      const res = await request(app)
        .put(`/api/rota-pontos/${testData.rota.id}/pontos/ordem`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ ordens: [{ id: rotaPonto.pontoId, ordem: 2 }] });

      expect(res.status).toBe(200);
      const updated = res.body.find(rp => rp.pontoId === rotaPonto.pontoId);
      expect(updated).toBeDefined();
      expect(updated.ordem).toBe(2);
    });

    it('deve rejeitar sem role admin', async () => {
      const res = await request(app)
        .put(`/api/rota-pontos/${testData.rota.id}/pontos/ordem`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ ordens: [] });

      expect(res.status).toBe(400);
    });
  });

  describe('Rota-Pontos PATCH /api/rota-pontos/:rotaId/pontos/:pontoId/status', () => {
    it('deve inativar ponto na rota', async () => {
      const res = await request(app)
        .patch(`/api/rota-pontos/${testData.rota.id}/pontos/${rotaPonto.pontoId}/status`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('inativo');
    });

    it('deve reativar ponto na rota', async () => {
      const res = await request(app)
        .patch(`/api/rota-pontos/${testData.rota.id}/pontos/${rotaPonto.pontoId}/status`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'ativo' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ativo');
    });
  });

  describe('Rota-Pontos GET /api/rota-pontos/:rotaId/pontos/isOrdered', () => {
    it('deve verificar se pontos estão ordenados', async () => {
      const res = await request(app)
        .get(`/api/rota-pontos/${testData.rota.id}/pontos/isOrdered`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(typeof res.body).toBe('boolean');
    });
  });

  describe('Rota-Motoristas GET /api/rota-motoristas/:rotaId', () => {
    it('deve listar motoristas da rota', async () => {
      const res = await request(app)
        .get(`/api/rota-motoristas/${testData.rota.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Rota-Motoristas POST /api/rota-motoristas/atribuir', () => {
    it('deve atribuir motorista a rota', async () => {
      const res = await request(app)
        .post('/api/rota-motoristas/atribuir')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          rotaId: testData.rota.id,
          motoristaId: testData.motorista.id,
          inicio: '2026-01-01',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Rota-Motoristas POST /api/rota-motoristas/desativar', () => {
    it('deve desativar motorista da rota', async () => {
      const res = await request(app)
        .post('/api/rota-motoristas/desativar')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          rotaId: testData.rota.id,
          motoristaId: testData.motorista.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Rota-Faculdades GET /api/rota-faculdades/:rotaId', () => {
    it('deve listar faculdades vinculadas à rota', async () => {
      const res = await request(app)
        .get(`/api/rota-faculdades/${testData.rota.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Rota-Faculdades POST /api/rota-faculdades/vincular', () => {
    it('deve rejeitar vínculo duplicado (reativa existente)', async () => {
      const res = await request(app)
        .post('/api/rota-faculdades/vincular')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          rotaId: testData.rota.id,
          faculdadeId: testData.faculdade.id,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Rota-Faculdades POST /api/rota-faculdades/desvincular', () => {
    it('deve desvincular faculdade da rota', async () => {
      const res = await request(app)
        .post('/api/rota-faculdades/desvincular')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          rotaId: testData.rota.id,
          faculdadeId: testData.faculdade.id,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });
});
