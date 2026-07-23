import { logger } from './logger.js';

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];

const PRODUCTION_REQUIRED = [
  'CORS_ORIGIN',
  'JWT_SECRET',
];

export function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.fatal({ missing }, 'Variáveis de ambiente obrigatórias não configuradas');
    console.error(`Variáveis obrigatórias faltando: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    const prodMissing = PRODUCTION_REQUIRED.filter((key) => !process.env[key]);
    if (prodMissing.length > 0) {
      logger.fatal({ missing: prodMissing }, 'Produção: variáveis obrigatórias não configuradas');
      console.error(`Produção: variáveis obrigatórias faltando: ${prodMissing.join(', ')}`);
      process.exit(1);
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      logger.warn('JWT_SECRET muito curto (< 32 caracteres) — use um valor mais forte em produção');
    }
  }

  const warnMissing = [
    'TELEGRAM_BOT_TOKEN',
    'API_URL',
    'CORS_ORIGIN',
  ].filter((key) => !process.env[key]);
  if (warnMissing.length > 0) {
    logger.warn({ missing: warnMissing }, 'Variáveis de ambiente recomendadas não configuradas');
  }
}
