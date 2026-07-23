import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Signup Integration Tests', () => {
  let app;
  let testData;
  let signupUser;
  let signupUserId;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/signup/request', () => {
    const uid = Date.now();
    const email = `signup_${uid}@teste.com`;

    it('deve criar solicitação com dados válidos', async () => {
      const res = await request(app)
        .post('/api/signup/request')
        .send({
          nome: 'Aluno Teste Signup',
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

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nome', 'Aluno Teste Signup');
      expect(res.body).toHaveProperty('email', email);
      expect(res.body).toHaveProperty('tipo', 'aluno');
      expect(res.body).toHaveProperty('aluno');
      expect(res.body.aluno).toHaveProperty('statusCadastro', 'pendente');
      expect(res.body.aluno).toHaveProperty('cpf', '12345678901');
      expect(res.body.aluno).toHaveProperty('cursoId', testData.curso.id);

      signupUser = res.body;
      signupUserId = res.body.id;
    });

    it('deve rejeitar email já cadastrado', async () => {
      const res = await request(app)
        .post('/api/signup/request')
        .send({ nome: 'Outro Aluno', email, senha: 'Senha@123' });

      expect(res.status).toBe(409);
    });

    it('deve rejeitar sem nome', async () => {
      const res = await request(app)
        .post('/api/signup/request')
        .send({ email: `sem_nome_${uid}@teste.com`, senha: 'Senha@123' });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar sem email', async () => {
      const res = await request(app)
        .post('/api/signup/request')
        .send({ nome: 'Sem Email', senha: 'Senha@123' });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar sem senha', async () => {
      const res = await request(app)
        .post('/api/signup/request')
        .send({ nome: 'Sem Senha', email: `sem_senha_${uid}@teste.com` });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar email inválido', async () => {
      const res = await request(app)
        .post('/api/signup/request')
        .send({ nome: 'Email Invalido', email: 'invalido', senha: 'Senha@123' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('details');
    });

    it('deve rejeitar nome muito curto', async () => {
      const res = await request(app)
        .post('/api/signup/request')
        .send({ nome: 'AB', email: `nome_curto_${uid}@teste.com`, senha: 'Senha@123' });

      expect(res.status).toBe(400);
    });

    it('deve aceitar apenas com campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/signup/request')
        .send({ nome: 'Minimo Teste', email: `minimo_${uid}@teste.com`, senha: 'Senha@123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.aluno).toHaveProperty('statusCadastro', 'pendente');
    });
  });

  describe('GET /api/signup/me (auth required)', () => {
    it('deve retornar perfil do solicitante autenticado', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: signupUser.email, senha: 'Senha@123' });

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.accessToken;

      const res = await request(app)
        .get('/api/signup/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', signupUserId);
      expect(res.body).toHaveProperty('email', signupUser.email);
      expect(res.body).toHaveProperty('statusCadastro', 'pendente');
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get('/api/signup/me');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/signup (admin)', () => {
    it('deve listar solicitações como admin', async () => {
      const res = await request(app)
        .get('/api/signup')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get('/api/signup');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/signup/pending (admin)', () => {
    it('deve listar solicitações pendentes', async () => {
      const res = await request(app)
        .get('/api/signup/pending')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const pendentes = res.body.filter(r => r.statusCadastro === 'pendente');
      expect(pendentes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/signup/paginated (admin)', () => {
    it('deve retornar solicitações paginadas', async () => {
      const res = await request(app)
        .get('/api/signup/paginated')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('deve filtrar por status', async () => {
      const res = await request(app)
        .get('/api/signup/paginated?status=pendente')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(r => r.statusCadastro === 'pendente')).toBe(true);
    });
  });

  describe('GET /api/signup/:id (admin detail)', () => {
    it('deve retornar detalhes da solicitação', async () => {
      const res = await request(app)
        .get(`/api/signup/${signupUserId}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', signupUserId);
      expect(res.body).toHaveProperty('nome', 'Aluno Teste Signup');
    });

    it('deve retornar erro para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/signup/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Requisição não encontrada');
    });

    it('deve rejeitar UUID inválido', async () => {
      const res = await request(app)
        .get('/api/signup/id-invalido')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/signup/:id/approve (admin)', () => {
    it('deve aprovar solicitação pendente', async () => {
      const res = await request(app)
        .put(`/api/signup/${signupUserId}/approve`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('usuario');
      expect(res.body.usuario).toHaveProperty('status', 'ativo');
      expect(res.body).toHaveProperty('aluno');
      expect(res.body.aluno).toHaveProperty('statusCadastro', 'ativo');
      expect(res.body).toHaveProperty('carteirinha');
      expect(res.body.carteirinha).toHaveProperty('signedUrl');
    });

    it('deve rejeitar aprovação já aprovada', async () => {
      const res = await request(app)
        .put(`/api/signup/${signupUserId}/approve`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/alunos/me (após aprovação)', () => {
    it('deve retornar perfil completo do aluno', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: signupUser.email, senha: 'Senha@123' });

      expect(loginRes.status).toBe(200);
      const token = loginRes.body.accessToken;

      const res = await request(app)
        .get('/api/alunos/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', signupUserId);
      expect(res.body).toHaveProperty('statusCadastro', 'ativo');
    });
  });

  describe('PUT /api/signup/:id/reprove (admin)', () => {
    let reproveUserId;

    beforeAll(async () => {
      const uid = Date.now();
      const res = await request(app)
        .post('/api/signup/request')
        .send({ nome: 'Aluno Reprovar', email: `reprovar_${uid}@teste.com`, senha: 'Senha@123' });
      if (res.status === 201) {
        reproveUserId = res.body.id;
      }
    });

    it('deve reprovar solicitação pendente', async () => {
      if (!reproveUserId) return;

      const res = await request(app)
        .put(`/api/signup/${reproveUserId}/reprove`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('aluno');
      expect(res.body.aluno).toHaveProperty('statusCadastro', 'reprovado');
    });
  });

  describe('PATCH /api/signup/:id (atualizar docs)', () => {
    it('deve atualizar documentos da solicitação', async () => {
      const uid = Date.now();
      const create = await request(app)
        .post('/api/signup/request')
        .send({ nome: 'Aluno Docs', email: `docs_${uid}@teste.com`, senha: 'Senha@123' });

      if (create.status !== 201) return;
      const alunoId = create.body.id;

      const res = await request(app)
        .patch(`/api/signup/${alunoId}`)
        .send({
          comprovante_matricula_url: 'https://exemplo.com/matricula.pdf',
          comprovante_residencia_url: 'https://exemplo.com/residencia.pdf',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('comprovanteMatriculaUrl', 'https://exemplo.com/matricula.pdf');
      expect(res.body).toHaveProperty('comprovanteResidenciaUrl', 'https://exemplo.com/residencia.pdf');
    });
  });
});
