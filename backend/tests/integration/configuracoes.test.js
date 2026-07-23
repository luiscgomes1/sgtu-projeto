import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Configuracoes Integration Tests', () => {
  let app;
  let testData;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();

    // Ensure config row exists
    const existing = await prisma.configuracao.findUnique({ where: { id: 1 } });
    if (!existing) {
      await prisma.configuracao.create({
        data: { id: 1, horaLimitePresenca: '08:00' },
      });
    }
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/configuracoes/hora-limite (public)', () => {
    it('deve retornar hora limite de presença', async () => {
      const res = await request(app).get('/api/configuracoes/hora-limite');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('hora_limite_presenca');
    });
  });

  describe('GET /api/configuracoes (admin)', () => {
    it('deve retornar configurações completas', async () => {
      const res = await request(app)
        .get('/api/configuracoes')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('horaLimitePresenca');
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app).get('/api/configuracoes');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/configuracoes/hora-limite (admin)', () => {
    it('deve atualizar hora limite', async () => {
      const res = await request(app)
        .put('/api/configuracoes/hora-limite')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ horaLimite: '09:30' });

      expect(res.status).toBe(200);
      expect(res.body.horaLimitePresenca).toContain(':30:');
    });

    it('deve rejeitar formato inválido', async () => {
      const res = await request(app)
        .put('/api/configuracoes/hora-limite')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ horaLimite: '25:00' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/configuracoes/logo (admin)', () => {
    it('deve atualizar logo URL', async () => {
      const res = await request(app)
        .put('/api/configuracoes/logo')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ logoUrl: 'https://exemplo.com/logo.png' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('logoUrl', 'https://exemplo.com/logo.png');
    });

    it('deve rejeitar URL inválida', async () => {
      const res = await request(app)
        .put('/api/configuracoes/logo')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ logoUrl: 'invalido' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/configuracoes/nome-organizacao (admin)', () => {
    it('deve atualizar nome da organização', async () => {
      const res = await request(app)
        .put('/api/configuracoes/nome-organizacao')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nomeOrganizacao: 'Nova Organização Ltda' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('nomeOrganizacao', 'Nova Organização Ltda');
    });

    it('deve rejeitar nome muito curto', async () => {
      const res = await request(app)
        .put('/api/configuracoes/nome-organizacao')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nomeOrganizacao: 'AB' });

      expect(res.status).toBe(400);
    });
  });
});
