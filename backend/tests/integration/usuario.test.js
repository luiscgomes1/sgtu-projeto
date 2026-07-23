import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Usuário Integration Tests', () => {
  let app;
  let testData;
  let adminTokenStr;
  let alunoId;
  let alunoToken;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
    adminTokenStr = adminToken();

    // Create and approve an aluno for non-admin tests
    const uid = Date.now();
    const email = `usuario_aluno_${uid}@teste.com`;

    const signupRes = await request(app)
      .post('/api/signup/request')
      .send({
        nome: 'Aluno Usuario Test',
        email,
        senha: 'Senha@123',
        rg: '44.444.444-4',
        cpf: '44444444444',
        telefone: '(34) 94444-4444',
        data_nascimento: '2000-01-15',
        endereco: 'Rua Teste, 100',
        tipo_sanguineo: 'O+',
        curso_id: testData.curso.id,
      });

    if (signupRes.status !== 201) throw new Error('Falha ao criar aluno');
    alunoId = signupRes.body.id;

    const approveRes = await request(app)
      .put(`/api/signup/${alunoId}/approve`)
      .set('Authorization', `Bearer ${adminTokenStr}`);

    if (approveRes.status !== 200) throw new Error('Falha ao aprovar aluno');

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, senha: 'Senha@123' });
    if (loginRes.status !== 200) throw new Error('Falha ao fazer login');
    alunoToken = loginRes.body.accessToken;
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/usuario/me', () => {
    it('deve retornar perfil do admin', async () => {
      const res = await request(app)
        .get('/api/usuario/me')
        .set('Authorization', `Bearer ${adminTokenStr}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tipo', 'admin');
    });

    it('deve retornar perfil do aluno', async () => {
      const res = await request(app)
        .get('/api/usuario/me')
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('aluno');
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get('/api/usuario/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/usuario/me', () => {
    it('deve atualizar nome do perfil', async () => {
      const res = await request(app)
        .put('/api/usuario/me')
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({ nome: 'Nome Atualizado' });

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Nome Atualizado');
    });

    it('deve rejeitar nome curto', async () => {
      const res = await request(app)
        .put('/api/usuario/me')
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({ nome: 'AB' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/usuario/me/validar-senha', () => {
    it('deve validar senha correta', async () => {
      const res = await request(app)
        .post('/api/usuario/me/validar-senha')
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({ senha: 'Senha@123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('valida', true);
    });

    it('deve rejeitar senha incorreta', async () => {
      const res = await request(app)
        .post('/api/usuario/me/validar-senha')
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({ senha: 'senha_errada' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('valida', false);
    });
  });

  describe('PATCH /api/usuario/me/senha', () => {
    it('deve alterar senha', async () => {
      const res = await request(app)
        .patch('/api/usuario/me/senha')
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({
          senhaAtual: 'Senha@123',
          novaSenha: 'NovaSenha@456',
        });

      expect(res.status).toBe(200);

      // Revert
      await request(app)
        .patch('/api/usuario/me/senha')
        .set('Authorization', `Bearer ${alunoToken}`)
        .send({
          senhaAtual: 'NovaSenha@456',
          novaSenha: 'Senha@123',
        });
    });
  });

  describe('POST /api/usuario/me/telegram/token', () => {
    it('deve gerar token do telegram', async () => {
      const res = await request(app)
        .post('/api/usuario/me/telegram/token')
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('link');
      expect(res.body.link).toContain('t.me/');
    });
  });

  describe('GET /api/usuario/me/telegram/status', () => {
    it('deve retornar status do telegram', async () => {
      const res = await request(app)
        .get('/api/usuario/me/telegram/status')
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('conectado');
    });
  });

  describe('POST /api/usuario/me/telegram/desconectar', () => {
    it('deve desconectar telegram', async () => {
      const res = await request(app)
        .post('/api/usuario/me/telegram/desconectar')
        .set('Authorization', `Bearer ${alunoToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });
});
