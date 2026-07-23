import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Presenças Integration Tests', () => {
  let app;
  let testData;
  let alunoUser;
  let alunoId;
  let viagem;
  let presenca;
  let alunoToken;
  let carteirinha;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();

    // Create and approve an aluno
    const uid = Date.now();
    const email = `presencas_aluno_${uid}@teste.com`;

    const signupRes = await request(app)
      .post('/api/signup/request')
      .send({
        nome: 'Aluno Presencas Test',
        email,
        senha: 'Senha@123',
        rg: '22.222.222-2',
        cpf: '22222222222',
        telefone: '(34) 92222-2222',
        data_nascimento: '2000-01-15',
        endereco: 'Rua Teste, 100',
        tipo_sanguineo: 'O+',
        curso_id: testData.curso.id,
      });

    if (signupRes.status !== 201) throw new Error('Falha ao criar aluno');

    alunoId = signupRes.body.id;

    const approveRes = await request(app)
      .put(`/api/signup/${alunoId}/approve`)
      .set('Authorization', `Bearer ${adminToken()}`);

    if (approveRes.status !== 200) throw new Error('Falha ao aprovar aluno');

    alunoUser = approveRes.body.usuario;

    // Login as aluno
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, senha: 'Senha@123' });

    if (loginRes.status !== 200) throw new Error('Falha ao fazer login');
    alunoToken = loginRes.body.accessToken;

    // Link rota-faculdade
    await prisma.rotaFaculdade.create({
      data: { rotaId: testData.rota.id, faculdadeId: testData.faculdade.id, status: 'ativo' },
    });

    // Create a valid carteirinha in DB (bypasses storage)
    carteirinha = await prisma.carteirinha.create({
      data: {
        alunoId,
        dataValidade: new Date('2099-12-31'),
        qrcodeToken: 'c4a1e2b3-0000-4000-8000-000000000000',
        criadoPorId: testData.admin.id,
      },
    });

    // Seed config with future horaLimite (Time field expects a Date)
    const horaLimite = new Date();
    horaLimite.setHours(23, 59, 0, 0);
    await prisma.configuracao.upsert({
      where: { id: 1 },
      update: { horaLimitePresenca: horaLimite },
      create: { id: 1, horaLimitePresenca: horaLimite },
    });

    // Create a viagem
    viagem = await prisma.viagem.create({
      data: {
        rotaId: testData.rota.id,
        data: new Date(),
        status: 'fechada',
      },
    });

    // Create a presenca
    presenca = await prisma.presenca.create({
      data: {
        alunoId,
        rotaId: testData.rota.id,
        viagemId: viagem.id,
        data: new Date(),
        status: 'ativo',
        confirmado: true,
      },
    });
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/presencas/rota/:rotaId', () => {
    it('deve listar presenças por rota', async () => {
      const res = await request(app)
        .get(`/api/presencas/rota/${testData.rota.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get(`/api/presencas/rota/${testData.rota.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/presencas/aluno/:alunoId', () => {
    it('deve listar presenças por aluno', async () => {
      const res = await request(app)
        .get(`/api/presencas/aluno/${alunoId}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('DELETE /api/presencas/:id/desativar', () => {
    it('deve desativar presença', async () => {
      const res = await request(app)
        .delete(`/api/presencas/${presenca.id}/desativar`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/presencas/marcar-presenca', () => {
    it('deve marcar presença do aluno autenticado', async () => {
      const res = await request(app)
        .post('/api/presencas/marcar-presenca')
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('data');
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).post('/api/presencas/marcar-presenca');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/presencas/confirmar-embarque', () => {
    it('deve rejeitar token inválido', async () => {
      const res = await request(app)
        .post('/api/presencas/confirmar-embarque')
        .send({ token: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Não autorizado');
    });
  });

  describe('POST /api/presencas/confirmar-volta', () => {
    it('deve rejeitar token inválido', async () => {
      const res = await request(app)
        .post('/api/presencas/confirmar-volta')
        .send({ token: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Não autorizado');
    });
  });
});
