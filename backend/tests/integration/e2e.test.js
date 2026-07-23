import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('E2E Complete Flow', () => {
  let app;
  let testData;
  let studentId;
  let studentToken;

  const student = {
    nome: 'Aluno E2E Teste',
    email: `e2e_student_${Date.now()}@teste.com`,
    senha: 'Senha@123',
  };

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  }, 30000);

  afterAll(async () => {
    if (studentId) {
      await prisma.presenca.deleteMany({ where: { alunoId: studentId } });
      await prisma.carteirinha.deleteMany({ where: { alunoId: studentId } });
      await prisma.cadastroHistorico.deleteMany({ where: { alunoId: studentId } });
      await prisma.aluno.deleteMany({ where: { usuarioId: studentId } });
      await prisma.refreshToken.deleteMany({ where: { usuarioId: studentId } });
      await prisma.usuario.deleteMany({ where: { id: studentId } });
    }
    await cleanupTestData();
  }, 15000);

  it('1. Health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('2. POST /api/signup/request — criar conta', async () => {
    const res = await request(app)
      .post('/api/signup/request')
      .send({
        nome: student.nome,
        email: student.email,
        senha: student.senha,
        rg: '12.345.678-9',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.aluno).toHaveProperty('statusCadastro', 'pendente');
    studentId = res.body.id;
  });

  it('3. PUT /api/signup/:id/approve — admin aprova', async () => {
    const res = await request(app)
      .put(`/api/signup/${studentId}/approve`)
      .set('Authorization', `Bearer ${adminToken()}`);

    // Aluno é aprovado mesmo se PDF da carteirinha falhar (sem Supabase nos testes)
    const aluno = await prisma.aluno.findUnique({
      where: { usuarioId: studentId },
      select: { statusCadastro: true },
    });
    expect(aluno?.statusCadastro).toBe('ativo');
  });

  it('4. POST /api/auth/login — aluno faz login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: student.email, senha: student.senha });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(student.email);
    studentToken = res.body.accessToken;
  });

  it('5. GET /api/usuario/me — perfil autenticado', async () => {
    const res = await request(app)
      .get('/api/usuario/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(student.email);
    expect(res.body.tipo).toBe('aluno');
  });

  it('6. GET /api/usuario/me sem token — rejeita 401', async () => {
    const res = await request(app).get('/api/usuario/me');
    expect(res.status).toBe(401);
  });

  it('7. Admin lista alunos', async () => {
    const res = await request(app)
      .get('/api/signup/')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('8. Aluno sem role admin não acessa rota admin', async () => {
    const res = await request(app)
      .get('/api/signup/')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});
