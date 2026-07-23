import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Relatorios Integration Tests', () => {
  let app;
  let testData;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/relatorios/presencas/rota/:rotaId', () => {
    it('deve retornar relatório de presenças por rota', async () => {
      const res = await request(app)
        .get(`/api/relatorios/presencas/rota/${testData.rota.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('rotaId', testData.rota.id);
      expect(res.body).toHaveProperty('totalPresencas');
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app)
        .get(`/api/relatorios/presencas/rota/${testData.rota.id}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/relatorios/presencas/aluno/:alunoId', () => {
    it('deve retornar relatório de presenças por aluno', async () => {
      const res = await request(app)
        .get(`/api/relatorios/presencas/aluno/${testData.admin.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('alunoId', testData.admin.id);
    });

    it('deve rejeitar UUID inválido', async () => {
      const res = await request(app)
        .get('/api/relatorios/presencas/aluno/invalido')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/relatorios/presencas/motorista/:motoristaId', () => {
    it('deve retornar relatório de presenças por motorista', async () => {
      const res = await request(app)
        .get(`/api/relatorios/presencas/motorista/${testData.motorista.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('motoristaId', testData.motorista.id);
    });
  });

  describe('GET /api/relatorios/presencas/faculdade/:faculdadeId', () => {
    it('deve retornar relatório de presenças por faculdade', async () => {
      const res = await request(app)
        .get(`/api/relatorios/presencas/faculdade/${testData.faculdade.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('faculdadeId', testData.faculdade.id);
    });
  });

  describe('GET /api/relatorios/presencas/curso/:cursoId', () => {
    it('deve retornar relatório de presenças por curso', async () => {
      const res = await request(app)
        .get(`/api/relatorios/presencas/curso/${testData.curso.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('cursoId', testData.curso.id);
    });
  });

  describe('GET /api/relatorios/geral', () => {
    it('deve retornar relatório geral', async () => {
      const res = await request(app)
        .get('/api/relatorios/geral')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totals');
      expect(res.body.totals).toHaveProperty('alunos');
      expect(res.body.totals).toHaveProperty('motoristas');
      expect(res.body.totals).toHaveProperty('rotas');
      expect(res.body.totals).toHaveProperty('faculdades');
      expect(res.body).toHaveProperty('presencasMes');
    });
  });

  describe('GET /api/relatorios/geral/pdf', () => {
    it('deve gerar PDF do relatório geral', async () => {
      const res = await request(app)
        .get('/api/relatorios/geral/pdf')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
    });
  });

  describe('GET /api/relatorios/geral/excel', () => {
    it('deve gerar Excel do relatório geral', async () => {
      const res = await request(app)
        .get('/api/relatorios/geral/excel')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('spreadsheetml');
    });
  });
});
