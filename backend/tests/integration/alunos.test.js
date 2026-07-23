import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Alunos Integration Tests', () => {
  let app;
  let testData;
  let alunoUser;
  let alunoUserId;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();

    // Create an approved aluno via signup request -> approve
    const uid = Date.now();
    const email = `aluno_test_${uid}@teste.com`;

    const signupRes = await request(app)
      .post('/api/signup/request')
      .send({
        nome: 'Aluno Teste Alunos',
        email,
        senha: 'Senha@123',
        rg: '12.345.678-9',
        cpf: '12345678901',
        telefone: '(34) 99999-9999',
        data_nascimento: '2000-01-15',
        endereco: 'Rua dos Alunos, 100',
        tipo_sanguineo: 'O+',
        curso_id: testData.curso.id,
      });

    if (signupRes.status !== 201) throw new Error('Falha ao criar usuário de teste');

    alunoUserId = signupRes.body.id;

    const approveRes = await request(app)
      .put(`/api/signup/${alunoUserId}/approve`)
      .set('Authorization', `Bearer ${adminToken()}`);

    if (approveRes.status !== 200) throw new Error('Falha ao aprovar usuário');

    alunoUser = approveRes.body.usuario;
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/alunos (admin list)', () => {
    it('deve listar todos os alunos', async () => {
      const res = await request(app)
        .get('/api/alunos')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const encontrado = res.body.find(a => a.usuarioId === alunoUserId);
      expect(encontrado).toBeDefined();
      expect(encontrado.usuario.nome).toBe('Aluno Teste Alunos');
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get('/api/alunos');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/alunos/paginated', () => {
    it('deve retornar alunos paginados', async () => {
      const res = await request(app)
        .get('/api/alunos/paginated')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('deve filtrar por status_cadastro', async () => {
      const res = await request(app)
        .get('/api/alunos/paginated?status_cadastro=ativo')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(a => a.statusCadastro === 'ativo')).toBe(true);
    });
  });

  describe('GET /api/alunos/counts', () => {
    it('deve retornar contagens por status', async () => {
      const res = await request(app)
        .get('/api/alunos/counts')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pendentes');
      expect(res.body).toHaveProperty('ativos');
      expect(res.body).toHaveProperty('reprovados');
      expect(res.body.ativos).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/alunos/estatisticas', () => {
    it('deve retornar estatísticas por curso e faculdade', async () => {
      const res = await request(app)
        .get('/api/alunos/estatisticas')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('porCurso');
      expect(res.body).toHaveProperty('porFaculdade');
      expect(Array.isArray(res.body.porCurso)).toBe(true);
    });
  });

  describe('GET /api/alunos/me', () => {
    it('deve retornar perfil do aluno autenticado', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: alunoUser.email, senha: 'Senha@123' });

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.accessToken;

      const res = await request(app)
        .get('/api/alunos/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('usuarioId', alunoUserId);
      expect(res.body).toHaveProperty('statusCadastro', 'ativo');
    });
  });

  describe('GET /api/alunos/:id', () => {
    it('deve retornar aluno por usuarioId', async () => {
      const res = await request(app)
        .get(`/api/alunos/${alunoUserId}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('usuarioId', alunoUserId);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/alunos/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/alunos/me (update own profile)', () => {
    it('deve atualizar próprio perfil', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: alunoUser.email, senha: 'Senha@123' });
      const token = loginRes.body.accessToken;

      const res = await request(app)
        .put('/api/alunos/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ telefone: '(34) 98888-8888' });

      expect(res.status).toBe(200);
    });

    it('deve rejeitar campos inválidos', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: alunoUser.email, senha: 'Senha@123' });
      const token = loginRes.body.accessToken;

      const res = await request(app)
        .put('/api/alunos/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'AB' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/alunos/:id/reenviar-documentos', () => {
    it('deve reenviar documentos como próprio aluno', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: alunoUser.email, senha: 'Senha@123' });
      const token = loginRes.body.accessToken;

      const res = await request(app)
        .post(`/api/alunos/${alunoUserId}/reenviar-documentos`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Aluno Atualizado',
          email: alunoUser.email,
          rg: '98.765.432-1',
          cpf: '98765432100',
          telefone: '(34) 97777-7777',
          data_nascimento: '1999-05-20',
          endereco: 'Rua Nova, 200',
          tipo_sanguineo: 'A+',
          curso_id: testData.curso.id,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('statusCadastro', 'pendente');
    });
  });
});
