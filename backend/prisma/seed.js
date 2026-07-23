import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('Configure DATABASE_URL no .env');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function loadDados(arquivo, padrao) {
  const path = resolve(__dirname, arquivo);
  if (existsSync(path)) {
    const dados = JSON.parse(readFileSync(path, 'utf-8'));
    console.log(`  📦 ${arquivo} encontrado (${dados.length} registros)`);
    return dados;
  }
  return padrao;
}

async function main() {
  console.log('🌱 Iniciando seed...');

  const senhaHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@sgtu.com' },
    update: {},
    create: {
      nome: 'Admin',
      email: 'admin@sgtu.com',
      senhaHash,
      tipo: 'admin',
      status: 'ativo',
    },
  });
  console.log(`  ✅ Admin: ${admin.email}`);

  // ── Faculdades (do JSON exportado ou padrão) ──
  const faculdadesPadrao = [
    { nome: 'Universidade Federal do Triângulo Mineiro (UFTM)', endereco: 'Av. Getúlio Guaritá, 159 - Uberaba - MG' },
    { nome: 'Universidade de Uberaba (UNIUBE)', endereco: 'Av. Nenê Sabino, 1801 - Uberaba - MG' },
    { nome: 'Instituto Federal do Triângulo Mineiro (IFTM)', endereco: 'Rua João Batista Ribeiro, 400 - Uberaba - MG' },
  ];

  const faculdadesImportadas = loadDados('dados-faculdades.json', null);

  if (faculdadesImportadas) {
    for (const f of faculdadesImportadas) {
      await prisma.faculdade.upsert({
        where: { id: f.id },
        update: { nome: f.nome, endereco: f.endereco, status: f.status || 'ativo' },
        create: { id: f.id, nome: f.nome, endereco: f.endereco, status: f.status || 'ativo' },
      });
    }
    console.log(`  ✅ ${faculdadesImportadas.length} faculdades restauradas do JSON`);
  } else {
    const criadas = await Promise.all(
      faculdadesPadrao.map((f) =>
        prisma.faculdade.create({ data: f })
      )
    );
    console.log(`  ✅ ${criadas.length} faculdades (padrão)`);
  }

  // ── Cursos (do JSON exportado ou padrão) ──
  const todosCursos = await prisma.curso.findMany();
  const cursosPadrao = [];

  if (todosCursos.length === 0) {
    const todasFaculdades = await prisma.faculdade.findMany();
    const cursosImportados = loadDados('dados-cursos.json', null);

    if (cursosImportados) {
      for (const c of cursosImportados) {
        const facExiste = await prisma.faculdade.findUnique({ where: { id: c.faculdadeId } });
        if (facExiste) {
          await prisma.curso.upsert({
            where: { id: c.id },
            update: { nome: c.nome, faculdadeId: c.faculdadeId, status: c.status || 'ativo' },
            create: { id: c.id, nome: c.nome, faculdadeId: c.faculdadeId, status: c.status || 'ativo' },
          });
        }
      }
      console.log(`  ✅ ${cursosImportados.length} cursos restaurados do JSON`);
    } else if (todasFaculdades.length >= 2) {
      const grade = [
        { nome: 'Ciência da Computação', faculdadeId: todasFaculdades[0].id },
        { nome: 'Engenharia Civil', faculdadeId: todasFaculdades[0].id },
        { nome: 'Direito', faculdadeId: todasFaculdades[1].id },
        { nome: 'Medicina', faculdadeId: todasFaculdades[1].id },
      ];
      if (todasFaculdades[2]) {
        grade.push(
          { nome: 'Administração', faculdadeId: todasFaculdades[2].id },
          { nome: 'Psicologia', faculdadeId: todasFaculdades[2].id },
        );
      }
      const criados = await Promise.all(
        grade.map((c) => prisma.curso.create({ data: c }))
      );
      console.log(`  ✅ ${criados.length} cursos (gerados)`);
    }
  } else {
    console.log(`  ✅ ${todosCursos.length} cursos já existentes (preservados)`);
  }

  // ── Aluno ──
  const cursosExistentes = await prisma.curso.findMany();
  const alunoUser = await prisma.usuario.upsert({
    where: { email: 'aluno@sgtu.com' },
    update: {},
    create: {
      nome: 'João Aluno',
      email: 'aluno@sgtu.com',
      senhaHash,
      tipo: 'aluno',
      status: 'ativo',
    },
  });

  await prisma.aluno.upsert({
    where: { usuarioId: alunoUser.id },
    update: {},
    create: {
      usuarioId: alunoUser.id,
      cursoId: cursosExistentes[0]?.id || null,
      rg: '2022001012345',
      cpf: '00011122233',
      telefone: '(34) 99999-0001',
      tipoSanguineo: 'O+',
      statusCadastro: 'aprovado',
    },
  });
  console.log(`  ✅ Aluno: ${alunoUser.email}`);

  // ── Motoristas ──
  const motoristas = await Promise.all([
    prisma.motorista.create({
      data: {
        nome: 'Carlos Motorista',
        cnh: '12345678901',
        telefone: '(34) 99999-0002',
        cpf: '11122233344',
      },
    }),
    prisma.motorista.create({
      data: {
        nome: 'Ana Motorista',
        cnh: '98765432100',
        telefone: '(34) 99999-0003',
        cpf: '22233344455',
      },
    }),
  ]);
  console.log(`  ✅ ${motoristas.length} motoristas`);

  // ── Pontos ──
  const pontos = await Promise.all([
    prisma.ponto.create({ data: { nome: 'Terminal Rodoviário de Uberaba', endereco: 'Av. Getúlio Guaritá, s/n' } }),
    prisma.ponto.create({ data: { nome: 'Praça da Catedral', endereco: 'Rua José Bonifácio, 100' } }),
    prisma.ponto.create({ data: { nome: 'UFTM - Unidade I', endereco: 'Av. Getúlio Guaritá, 159' } }),
    prisma.ponto.create({ data: { nome: 'Mercado Municipal', endereco: 'Rua São Paulo, 500' } }),
    prisma.ponto.create({ data: { nome: 'Uniube - Campus Aeroporto', endereco: 'Av. Nenê Sabino, 1801' } }),
  ]);
  console.log(`  ✅ ${pontos.length} pontos`);

  // ── Rotas ──
  const rotas = await Promise.all([
    prisma.rota.create({ data: { nome: 'Rota Azul' } }),
    prisma.rota.create({ data: { nome: 'Rota Verde' } }),
  ]);
  console.log(`  ✅ ${rotas.length} rotas`);

  // ── Vínculos ──
  const todasFaculdades = await prisma.faculdade.findMany();

  await prisma.rotaPonto.createMany({
    data: [
      { rotaId: rotas[0].id, pontoId: pontos[0].id, ordem: 1 },
      { rotaId: rotas[0].id, pontoId: pontos[1].id, ordem: 2 },
      { rotaId: rotas[0].id, pontoId: pontos[4].id, ordem: 3 },
      { rotaId: rotas[1].id, pontoId: pontos[2].id, ordem: 1 },
      { rotaId: rotas[1].id, pontoId: pontos[3].id, ordem: 2 },
      { rotaId: rotas[1].id, pontoId: pontos[4].id, ordem: 3 },
    ],
  });

  if (todasFaculdades.length >= 1) {
    await prisma.rotaFaculdade.createMany({
      data: [
        { rotaId: rotas[0].id, faculdadeId: todasFaculdades[0].id },
      ],
    });
    if (todasFaculdades[1]) {
      await prisma.rotaFaculdade.createMany({
        data: [{ rotaId: rotas[1].id, faculdadeId: todasFaculdades[1].id }],
      });
    }
  }

  await prisma.rotaMotorista.createMany({
    data: [
      { rotaId: rotas[0].id, motoristaId: motoristas[0].id },
      { rotaId: rotas[1].id, motoristaId: motoristas[1].id },
    ],
  });

  await prisma.escalaAtribuicao.createMany({
    data: [
      { rotaId: rotas[0].id, motoristaId: motoristas[0].id, ano: 2026, mes: 7, posicao: 1 },
      { rotaId: rotas[1].id, motoristaId: motoristas[1].id, ano: 2026, mes: 7, posicao: 1 },
    ],
  });
  console.log(`  ✅ Vínculos (pontos, faculdades, motoristas)`);

  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: {},
    create: {
      horaLimitePresenca: new Date(new Date().setHours(15, 0, 0, 0)),
      nomeOrganizacao: 'SGTU - Sistema de Gestão de Transporte Universitário',
    },
  });
  console.log(`  ✅ Configuração`);

  console.log('\n🎉 Seed concluído!');
  console.log('\n📋 Credenciais de teste:');
  console.log('  Admin: admin@sgtu.com / 123456');
  console.log('  Aluno: aluno@sgtu.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
