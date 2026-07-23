import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { writeFileSync } from 'fs';
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

async function main() {
  console.log('🔌 Conectado ao banco...');

  const faculdades = await prisma.faculdade.findMany();
  const cursos = await prisma.curso.findMany();

  if (faculdades.length === 0) {
    console.warn('⚠️  Nenhuma faculdade encontrada no banco.');
  } else {
    writeFileSync(resolve(__dirname, 'dados-faculdades.json'), JSON.stringify(faculdades, null, 2));
    console.log(`  ✅ ${faculdades.length} faculdades exportadas → dados-faculdades.json`);
  }

  if (cursos.length === 0) {
    console.warn('⚠️  Nenhum curso encontrado no banco.');
  } else {
    writeFileSync(resolve(__dirname, 'dados-cursos.json'), JSON.stringify(cursos, null, 2));
    console.log(`  ✅ ${cursos.length} cursos exportados → dados-cursos.json`);
  }

  console.log('\n🎉 Exportação concluída!');
}

main()
  .catch((e) => {
    console.error('❌ Erro na exportação:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
