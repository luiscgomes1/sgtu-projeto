import { prisma } from '../../config/prisma.js';

export async function healthController(req, res) {
  const checks = {
    database: false,
    storage: false,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  try {
    const { supabase } = await import('../../config/supabase.js');
    const { data } = await supabase.storage.listBuckets();
    checks.storage = Array.isArray(data);
  } catch {
    checks.storage = false;
  }

  const ok = checks.database && checks.storage;
  res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degradado', checks });
}
