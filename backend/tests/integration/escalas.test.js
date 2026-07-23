import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Escalas Integration Tests', () => {
  let app;
  let testData;

  const testAno = 2050 + Math.floor(Math.random() * 10);

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();

    await prisma.escalaAtribuicao.deleteMany({ where: { ano: testAno } });
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/escalas/automatica (admin)', () => {
    it('deve gerar escala automática para o ano', async () => {
      const res = await request(app)
        .post('/api/escalas/automatica')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ ano: testAno, motoristasIds: [testData.motorista.id] });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Escala gerada com sucesso.');
    });

    it('deve rejeitar escala já existente', async () => {
      const res = await request(app)
        .post('/api/escalas/automatica')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ ano: testAno, motoristasIds: [testData.motorista.id] });

      expect(res.status).toBe(500);
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app)
        .post('/api/escalas/automatica')
        .send({ ano: testAno + 1, motoristasIds: [testData.motorista.id] });

      expect(res.status).toBe(401);
    });

    it('deve rejeitar sem role admin', async () => {
      const uid = Date.now();
      const signupRes = await request(app)
        .post('/api/signup/request')
        .send({ nome: 'Aluno Escala', email: `escala_${uid}@teste.com`, senha: 'Senha@123' });

      if (signupRes.status !== 201) return;

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: `escala_${uid}@teste.com`, senha: 'Senha@123' });

      if (loginRes.status !== 200) return;

      const res = await request(app)
        .post('/api/escalas/automatica')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .send({ ano: testAno + 1, motoristasIds: [testData.motorista.id] });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/escalas/:ano', () => {
    it('deve listar escalas do ano', async () => {
      const res = await request(app)
        .get(`/api/escalas/${testAno}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('ano', testAno);
      expect(res.body[0]).toHaveProperty('mes');
      expect(res.body[0]).toHaveProperty('rotas');
    });
  });

  describe('GET /api/escalas/:ano/:mes', () => {
    it('deve listar motoristas do mês', async () => {
      const res = await request(app)
        .get(`/api/escalas/${testAno}/1`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PATCH /api/escalas/:ano/:mes/desativar (admin)', () => {
    it('deve desativar escala do mês', async () => {
      const res = await request(app)
        .patch(`/api/escalas/${testAno}/1/desativar`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', `Escala de 1/${testAno} desativada com sucesso.`);
    });
  });

  describe('DELETE /api/escalas/:ano/reset (admin, dev only)', () => {
    it('deve recusar reset fora de dev', async () => {
      const res = await request(app)
        .delete(`/api/escalas/${testAno}/reset`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(403);
    });
  });
});
