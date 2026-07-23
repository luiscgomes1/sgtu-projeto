import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, prisma } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('Upload Integration Tests', () => {
  let app;
  let testData;
  let alunoId;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();

    // Create aluno directly via DB (bypasses signup flow for simplicity)
    const uid = Date.now();
    const email = `upload_aluno_${uid}@teste.com`;

    const usuario = await prisma.usuario.create({
      data: {
        nome: 'Aluno Upload Test',
        email,
        senhaHash: '$2a$10$dummy',
        tipo: 'aluno',
        status: 'ativo',
      },
    });

    await prisma.aluno.create({
      data: {
        usuarioId: usuario.id,
        rg: '55.555.555-5',
        cpf: '55555555555',
        telefone: '(34) 95555-5555',
        dataNascimento: new Date('2000-01-15'),
        endereco: 'Rua Teste, 100',
        tipoSanguineo: 'O+',
        cursoId: testData.curso.id,
        statusCadastro: 'ativo',
      },
    });

    alunoId = usuario.id;
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/upload/:alunoId', () => {
    it('deve rejeitar menos de 3 arquivos', async () => {
      const res = await request(app)
        .post(`/api/upload/${alunoId}`)
        .attach('files', Buffer.from('dummy content'), 'test.pdf');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('3 arquivos');
    });

    it('deve rejeitar sem arquivos', async () => {
      const res = await request(app)
        .post(`/api/upload/${alunoId}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('3 arquivos');
    });
  });
});
