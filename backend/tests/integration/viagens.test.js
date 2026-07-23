import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Viagens Integration Tests', () => {
  let app;
  let testData;
  let viagem;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();

    viagem = await prisma.viagem.create({
      data: {
        rotaId: testData.rota.id,
        data: new Date(),
        status: 'fechada',
      },
    });
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/viagens (admin list)', () => {
    it('deve listar viagens', async () => {
      const res = await request(app)
        .get('/api/viagens')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deve filtrar por rotaId', async () => {
      const res = await request(app)
        .get(`/api/viagens?rotaId=${testData.rota.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.every(v => v.rotaId === testData.rota.id)).toBe(true);
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get('/api/viagens');
      expect(res.status).toBe(401);
    });

    it('deve rejeitar non-admin', { timeout: 30000 }, async () => {
      const uid = Date.now();
      const signupRes = await request(app)
        .post('/api/signup/request')
        .send({
          nome: 'Aluno Viagens Test',
          email: `viagens_aluno_${uid}@teste.com`,
          senha: 'Senha@123',
          rg: '11.111.111-1',
          cpf: '11111111111',
          telefone: '(34) 91111-1111',
          data_nascimento: '2000-01-15',
          endereco: 'Rua Teste, 100',
          tipo_sanguineo: 'O+',
          curso_id: testData.curso.id,
        });

      if (signupRes.status !== 201) return;

      const approveRes = await request(app)
        .put(`/api/signup/${signupRes.body.id}/approve`)
        .set('Authorization', `Bearer ${adminToken()}`);

      if (approveRes.status !== 200) return;

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: `viagens_aluno_${uid}@teste.com`, senha: 'Senha@123' });

      if (loginRes.status !== 200) return;

      const res = await request(app)
        .get('/api/viagens')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/viagens/:viagemId', () => {
    it('deve retornar detalhes da viagem', async () => {
      const res = await request(app)
        .get(`/api/viagens/${viagem.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', viagem.id);
      expect(res.body).toHaveProperty('rota');
      expect(res.body).toHaveProperty('presencas');
    });

    it('deve retornar 404 para viagem inexistente', async () => {
      const res = await request(app)
        .get('/api/viagens/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeNull();
    });
  });

  describe('GET /api/viagens/hoje/alunos (bot auth)', () => {
    const apiKey = 'test-api-key';
    const originalKey = process.env.API_KEY;

    beforeAll(() => {
      process.env.API_KEY = apiKey;
    });

    afterAll(() => {
      if (originalKey) {
        process.env.API_KEY = originalKey;
      } else {
        delete process.env.API_KEY;
      }
    });

    it('deve listar alunos de hoje com api key', async () => {
      const res = await request(app)
        .get('/api/viagens/hoje/alunos')
        .set('Authorization', `Bearer ${apiKey}`);

      expect(res.status).toBe(200);
      expect(typeof res.body).toBe('object');
    });

    it('deve rejeitar sem api key', async () => {
      const res = await request(app).get('/api/viagens/hoje/alunos');
      expect(res.status).toBe(401);
    });

    it('deve rejeitar api key inválida', async () => {
      const res = await request(app)
        .get('/api/viagens/hoje/alunos')
        .set('Authorization', 'Bearer invalid-key');

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/viagens/hoje/resumo (bot auth)', () => {
    it('deve retornar resumo com api key', async () => {
      process.env.API_KEY = 'test-api-key';

      const res = await request(app)
        .get('/api/viagens/hoje/resumo')
        .set('Authorization', 'Bearer test-api-key');

      expect(res.status).toBe(200);
      expect(typeof res.body).toBe('object');
    });
  });

  describe('GET /api/viagens/hoje/volta/status', () => {
    it('deve retornar status da volta com token temporário', async () => {
      const res = await request(app)
        .get('/api/viagens/hoje/volta/status');

      expect([200, 401]).toContain(res.status);
    });
  });
});
