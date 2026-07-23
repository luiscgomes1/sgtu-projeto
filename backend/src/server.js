import { validateEnv } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import app from './app.js';

validateEnv();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, async () => {
  logger.info({ port: PORT }, 'Servidor iniciado');

  try {
    await import('./bot/bot.js');
  } catch (err) {
    logger.warn({ err: err.message }, 'Bot do Telegram não iniciado');
  }
});

async function gracefulShutdown(signal) {
  logger.info({ signal }, 'Iniciando desligamento gracioso');

  server.close(() => {
    logger.info('Servidor HTTP fechado');
  });

  try {
    await prisma.$disconnect();
    logger.info('Prisma desconectado');
  } catch (err) {
    logger.error({ err }, 'Erro ao desconectar Prisma');
  }

  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
