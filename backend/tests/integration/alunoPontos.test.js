import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('AlunoPontos Integration Tests', () => {
  let app;
  let testData;
  let aluno;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();

    await prisma.alunoPonto.deleteMany({ where: { alunoId: testData.admin.id } });

    aluno = await prisma.aluno.create({
      data: {
        usuarioId: testData.admin.id,
        cursoId: testData.curso.id,
        statusCadastro: 'ativo',
        cpf: '00000000000',
      },
    });
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/aluno-pontos/vincular', () => {
    it('deve vincular aluno a ponto', async () => {
      const res = await request(app)
        .post('/api/aluno-pontos/vincular')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ alunoId: testData.admin.id, pontoId: testData.ponto.id });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Aluno vinculado ao ponto com sucesso.');
      expect(res.body.data).toHaveProperty('alunoId', testData.admin.id);
      expect(res.body.data).toHaveProperty('pontoId', testData.ponto.id);
      expect(res.body.data).toHaveProperty('status', 'ativo');
    });

    it('deve reativar vínculo existente', async () => {
      const res = await request(app)
        .post('/api/aluno-pontos/vincular')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ alunoId: testData.admin.id, pontoId: testData.ponto.id });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Vínculo reativado com sucesso.');
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app)
        .post('/api/aluno-pontos/vincular')
        .send({ alunoId: testData.admin.id, pontoId: testData.ponto.id });

      expect(res.status).toBe(401);
    });

    it('deve rejeitar UUID inválido', async () => {
      const res = await request(app)
        .post('/api/aluno-pontos/vincular')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ alunoId: 'invalido', pontoId: 'invalido' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/aluno-pontos/aluno/:alunoId', () => {
    it('deve listar ponto do aluno', async () => {
      const res = await request(app)
        .get(`/api/aluno-pontos/aluno/${testData.admin.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it('deve rejeitar UUID inválido', async () => {
      const res = await request(app)
        .get('/api/aluno-pontos/aluno/invalido')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/aluno-pontos/ponto/:pontoId', () => {
    it('deve listar alunos do ponto', async () => {
      const res = await request(app)
        .get(`/api/aluno-pontos/ponto/${testData.ponto.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/aluno-pontos/desvincular', () => {
    it('deve desvincular aluno do ponto', async () => {
      const res = await request(app)
        .post('/api/aluno-pontos/desvincular')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ alunoId: testData.admin.id, pontoId: testData.ponto.id });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Aluno desvinculado do ponto com sucesso.');
    });
  });
});
