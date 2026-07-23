import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Carteirinhas Integration Tests', () => {
  let app;
  let testData;
  let alunoId;
  let alunoToken;
  let carteirinha;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();

    // Create and approve an aluno
    const uid = Date.now();
    const email = `carteirinhas_aluno_${uid}@teste.com`;

    const signupRes = await request(app)
      .post('/api/signup/request')
      .send({
        nome: 'Aluno Carteirinhas Test',
        email,
        senha: 'Senha@123',
        rg: '33.333.333-3',
        cpf: '33333333333',
        telefone: '(34) 93333-3333',
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

    // Login as aluno
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, senha: 'Senha@123' });
    if (loginRes.status !== 200) throw new Error('Falha ao fazer login');
    alunoToken = loginRes.body.accessToken;

    // Create a carteirinha record directly in DB (bypasses Supabase storage)
    carteirinha = await prisma.carteirinha.create({
      data: {
        alunoId,
        dataValidade: new Date('2099-12-31'),
        qrcodeToken: 'c4a1e2b3-0000-4000-8000-111111111111',
        criadoPorId: testData.admin.id,
      },
    });
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/carteirinhas/validar-qrcode', () => {
    it('deve validar QR code válido', async () => {
      const res = await request(app)
        .post('/api/carteirinhas/validar-qrcode')
        .send({ token: carteirinha.qrcodeToken });

      expect(res.status).toBe(200);
      expect(res.body).toBe(alunoId);
    });

    it('deve rejeitar token inválido', async () => {
      const res = await request(app)
        .post('/api/carteirinhas/validar-qrcode')
        .send({ token: '00000000-0000-0000-0000-000000000000' });

      expect(res.status).toBe(401);
    });

    it('deve rejeitar token ausente', async () => {
      const res = await request(app)
        .post('/api/carteirinhas/validar-qrcode')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/carteirinhas/minha-carteirinha/:alunoId', () => {
    it('deve retornar carteirinha ativa do próprio aluno', async () => {
      const res = await request(app)
        .get(`/api/carteirinhas/minha-carteirinha/${alunoId}`)
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('alunoId', alunoId);
    });

    it('deve retornar como admin', async () => {
      const res = await request(app)
        .get(`/api/carteirinhas/minha-carteirinha/${alunoId}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app)
        .get(`/api/carteirinhas/minha-carteirinha/${alunoId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/carteirinhas/:alunoId (list)', () => {
    it('deve listar carteirinhas do aluno', async () => {
      const res = await request(app)
        .get(`/api/carteirinhas/${alunoId}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/carteirinhas/preview-mock', () => {
    it('deve retornar preview mockado', async () => {
      const res = await request(app).get('/api/carteirinhas/preview-mock');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
    });
  });
});
