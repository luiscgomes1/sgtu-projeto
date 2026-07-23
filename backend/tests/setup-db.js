import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testEnvPath = resolve(__dirname, '.env.test');

let testDbUrl;
try {
  const content = readFileSync(testEnvPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (key === 'DATABASE_URL') {
      testDbUrl = value;
      break;
    }
  }
} catch {
  console.error('tests/.env.test not found. Create it with DATABASE_URL pointing to a test database.');
  process.exit(1);
}

if (!testDbUrl) {
  console.error('DATABASE_URL not found in tests/.env.test');
  process.exit(1);
}

console.log(`Applying migrations to test database...`);
try {
  // Use db push instead of migrate deploy — the test DB may already have tables
  // or have a migration history that doesn't match. db push syncs the schema safely.
  execSync(`npx prisma db push --accept-data-loss`, {
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: 'inherit',
    cwd: resolve(__dirname, '..'),
  });
  console.log('Migrations applied successfully.');
} catch (err) {
  console.error('Failed to apply migrations:', err.message);
  process.exit(1);
}
