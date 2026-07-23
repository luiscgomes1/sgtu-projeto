import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../setup.js';
import { seedTestData, cleanupTestData, adminToken } from '../helpers/seed.js';

const hasDb = !!process.env.DATABASE_URL;

describe.runIf(hasDb)('API Integration Tests', () => {
  let app;
  let testData;

  beforeAll(async () => {
    testData = await seedTestData();
    app = createTestApp();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/faculdades/paginated', () => {
    it('deve retornar lista paginada de faculdades', async () => {
      const res = await request(app)
        .get('/api/faculdades/paginated')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page', 1);
      expect(res.body.pagination).toHaveProperty('limit', 20);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('deve filtrar por search', async () => {
      const res = await request(app)
        .get('/api/faculdades/paginated?search=Teste')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('deve rejeitar sem token', async () => {
      const res = await request(app).get('/api/faculdades/paginated');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/cursos/paginated', () => {
    it('deve retornar lista paginada de cursos', async () => {
      const res = await request(app)
        .get('/api/cursos/paginated')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/motoristas/paginated', () => {
    it('deve retornar lista paginada de motoristas', async () => {
      const res = await request(app)
        .get('/api/motoristas/paginated')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/pontos/paginated', () => {
    it('deve retornar lista paginada de pontos', async () => {
      const res = await request(app)
        .get('/api/pontos/paginated')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/rotas/paginated', () => {
    it('deve retornar lista paginada de rotas', async () => {
      const res = await request(app)
        .get('/api/rotas/paginated')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/faculdades (public list)', () => {
    it('deve retornar lista pública de faculdades sem token', async () => {
      const res = await request(app).get('/api/faculdades');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/pontos (public list)', () => {
    it('deve retornar lista pública de pontos sem token', async () => {
      const res = await request(app).get('/api/pontos');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/faculdades', () => {
    it('deve criar faculdade com dados válidos', async () => {
      const uid = Date.now();
      const nome = `Faculdade Create ${uid}`;
      const res = await request(app)
        .post('/api/faculdades')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome, endereco: `Rua Nova ${uid}, 123` });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nome', nome);
    });

    it('deve rejeitar nome muito curto', async () => {
      const res = await request(app)
        .post('/api/faculdades')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'AB', endereco: 'Rua Teste, 123' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('details');
    });

    it('deve rejeitar endereco muito curto', async () => {
      const res = await request(app)
        .post('/api/faculdades')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Faculdade Teste', endereco: 'Rua' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/cursos', () => {
    it('deve criar curso com dados válidos', async () => {
      const res = await request(app)
        .post('/api/cursos')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Novo Curso Teste', faculdade_id: testData.faculdade.id });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nome', 'Novo Curso Teste');
      expect(res.body).toHaveProperty('faculdadeId', testData.faculdade.id);
    });

    it('deve rejeitar curso sem faculdade_id', async () => {
      const res = await request(app)
        .post('/api/cursos')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Curso sem faculdade' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/motoristas', () => {
    it('deve criar motorista com dados válidos', async () => {
      const cpf = `${90000000000 + Date.now() % 100000}`.slice(0, 11);
      const res = await request(app)
        .post('/api/motoristas')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Novo Motorista Teste', cpf, cnh: cpf, telefone: '11988887777', data_nascimento: '1990-01-01', validade_cnh: '2025-12-31' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nome', 'Novo Motorista Teste');
    });

    it('deve rejeitar motorista sem nome', async () => {
      const res = await request(app)
        .post('/api/motoristas')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ cpf: '98765432100', data_nascimento: '1990-01-01', validade_cnh: '2025-12-31' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/pontos', () => {
    it('deve criar ponto com dados válidos', async () => {
      const nome = `Ponto Create ${Date.now()}`;
      const res = await request(app)
        .post('/api/pontos')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome, endereco: 'Rua do Ponto Novo, 789' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });
  });

  describe('POST /api/rotas', () => {
    it('deve criar rota com dados válidos', async () => {
      const nome = `Rota Create ${Date.now()}`;
      const res = await request(app)
        .post('/api/rotas')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('nome');
    });
  });

  describe('PUT /api/faculdades/:id', () => {
    it('deve atualizar faculdade existente', async () => {
      const uid = Date.now();
      const nome = `Faculdade Atualizada ${uid}`;
      const res = await request(app)
        .put(`/api/faculdades/${testData.faculdade.id}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome, endereco: `Rua Atualizada ${uid}, 456` });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('nome');
    });

    it('deve rejeitar atualização sem token', async () => {
      const res = await request(app)
        .put(`/api/faculdades/${testData.faculdade.id}`)
        .send({ nome: 'Faculdade Teste', endereco: 'Rua Teste, 123' });

      expect(res.status).toBe(401);
    });

    it('deve retornar 404 ao atualizar ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .put(`/api/faculdades/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ nome: 'Faculdade Fake', endereco: 'Rua Fake, 000' });

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/faculdades/:id (status)', () => {
    it('deve alterar status da faculdade', async () => {
      const res = await request(app)
        .patch(`/api/faculdades/${testData.faculdade.id}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'inativo' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'inativo');
    });

    it('deve rejeitar status inválido', async () => {
      const res = await request(app)
        .patch(`/api/faculdades/${testData.faculdade.id}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'invalido' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/faculdades/:id (detalhe)', () => {
    it('deve retornar faculdade por ID', async () => {
      const res = await request(app)
        .get(`/api/faculdades/${testData.faculdade.id}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testData.faculdade.id);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/faculdades/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('404 handling', () => {
    it('deve retornar 404 para rota inexistente', async () => {
      const res = await request(app).get('/api/rota-inexistente');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('UUID validation', () => {
    it('deve rejeitar UUID inválido em rota de detalhe', async () => {
      const res = await request(app)
        .get('/api/faculdades/id-invalido')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(400);
    });
  });
});
