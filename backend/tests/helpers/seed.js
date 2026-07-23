import { PrismaClient } from '../../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { DATABASE_URL, JWT_SECRET } = process.env;
if (!DATABASE_URL) throw new Error('DATABASE_URL is required for tests');

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const testIds = [];
let _adminId = null;

export async function seedTestData() {
  const senhaHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@sgtu.com' },
    update: {},
    create: {
      nome: 'Admin Teste',
      email: 'admin@sgtu.com',
      senhaHash,
      tipo: 'admin',
      status: 'ativo',
    },
  });
  _adminId = admin.id;
  testIds.push(admin.id);

  const faculdade = await prisma.faculdade.create({
    data: {
      nome: 'Faculdade Teste',
      endereco: 'Rua Teste, 123',
      status: 'ativo',
    },
  });
  testIds.push(faculdade.id);

  const curso = await prisma.curso.create({
    data: {
      nome: 'Curso Teste',
      faculdadeId: faculdade.id,
      status: 'ativo',
    },
  });
  testIds.push(curso.id);

  const motorista = await prisma.motorista.create({
    data: {
      nome: 'Motorista Teste',
      cpf: '12345678901',
      cnh: '12345678901',
      telefone: '11999999999',
      status: 'ativo',
    },
  });
  testIds.push(motorista.id);

  const ponto = await prisma.ponto.create({
    data: {
      nome: 'Ponto Teste',
      endereco: 'Rua do Ponto, 456',
      status: 'ativo',
    },
  });
  testIds.push(ponto.id);

  const rota = await prisma.rota.create({
    data: {
      nome: 'Rota Teste',
      status: 'ativo',
    },
  });
  testIds.push(rota.id);

  return { admin, faculdade, curso, motorista, ponto, rota };
}

export async function cleanupTestData() {
  const ids = [...testIds];
  testIds.length = 0;

  if (ids.length === 0) return;

  // Delete alunos referencing the tracked curso IDs (tests may create alunos)
  const cursoIds = ids.filter(id => id !== _adminId);
  if (cursoIds.length > 0) {
    const alunoRefs = await prisma.aluno.findMany({ where: { cursoId: { in: cursoIds } }, select: { usuarioId: true } });
    const alunoUsuarios = alunoRefs.map(a => a.usuarioId);
    await prisma.presenca.deleteMany({ where: { alunoId: { in: alunoUsuarios } } });
    await prisma.carteirinha.deleteMany({ where: { OR: [{ alunoId: { in: alunoUsuarios } }, { criadoPorId: { in: alunoUsuarios } }] } });
    await prisma.cadastroHistorico.deleteMany({ where: { OR: [{ alunoId: { in: alunoUsuarios } }, { alteradoPorId: { in: alunoUsuarios } }] } });
    await prisma.aluno.deleteMany({ where: { usuarioId: { in: alunoUsuarios } } });
    await prisma.usuario.deleteMany({ where: { id: { in: alunoUsuarios } } });
  }

  // Delete in reverse dependency order using the tracked IDs
  await prisma.presenca.deleteMany({ where: { alunoId: { in: ids } } });
  await prisma.viagem.deleteMany({ where: { rotaId: { in: ids } } });
  await prisma.rotaPonto.deleteMany({ where: { rotaId: { in: ids } } });
  await prisma.rotaMotorista.deleteMany({ where: { rotaId: { in: ids } } });
  await prisma.rotaFaculdade.deleteMany({ where: { rotaId: { in: ids } } });
  await prisma.escalaAtribuicao.deleteMany({ where: { OR: [{ rotaId: { in: ids } }, { motoristaId: { in: ids } }] } });
  await prisma.alunoPonto.deleteMany({ where: { alunoId: { in: ids } } });
  await prisma.carteirinha.deleteMany({ where: { alunoId: { in: ids } } });
  await prisma.cadastroHistorico.deleteMany({ where: { OR: [{ alunoId: { in: ids } }, { alteradoPorId: { in: ids } }] } });
  await prisma.aluno.deleteMany({ where: { usuarioId: { in: ids } } });

  // Delete the main entities
  await prisma.curso.deleteMany({ where: { id: { in: cursoIds } } });
  await prisma.faculdade.deleteMany({ where: { id: { in: ids } } });
  await prisma.rota.deleteMany({ where: { id: { in: ids } } });
  await prisma.ponto.deleteMany({ where: { id: { in: ids } } });
  await prisma.motorista.deleteMany({ where: { id: { in: ids } } });

  // Delete refresh tokens for tracked users (prevents O(n) bcrypt accumulation)
  await prisma.refreshToken.deleteMany({ where: { usuarioId: { in: ids } } });

  // Don't delete admin user — it might be needed across tests
  // await prisma.usuario.deleteMany({ where: { id: { in: ids } } });
}

export function adminToken() {
  const id = _adminId || '00000000-0000-0000-0000-000000000000';
  return jwt.sign(
    { id, email: 'admin@sgtu.com', tipo: 'admin' },
    JWT_SECRET || 'dev-secret',
    { expiresIn: '1h' }
  );
}

export { prisma };
