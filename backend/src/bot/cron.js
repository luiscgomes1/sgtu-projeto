import cron from "node-cron";
import { prisma } from '../config/prisma.js';
import { notifyCarteirinhaExpiring } from './notifications.js';
import { logger } from '../config/logger.js';

export function setupCrons() {
  cron.schedule("0 5 * * *", async () => {
    try {
      const { count } = await prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      if (count > 0) logger.info(`🧹 ${count} refresh tokens expirados removidos`);
    } catch (err) {
      logger.error({ err }, 'Erro ao limpar refresh tokens expirados');
    }

    try {
      const trintaDias = new Date();
      trintaDias.setDate(trintaDias.getDate() + 30);

      const expirando = await prisma.carteirinha.findMany({
        where: {
          dataValidade: { lte: trintaDias, gte: new Date() },
          aluno: { telegramId: { not: null } },
        },
        include: {
          aluno: { include: { usuario: { select: { nome: true } } } },
        },
      });

      for (const c of expirando) {
        const dataStr = c.dataValidade.toLocaleDateString('pt-BR');
        await notifyCarteirinhaExpiring(c.aluno.telegramId, c.aluno.usuario?.nome, dataStr);
      }
      if (expirando.length > 0) logger.info(`🔔 ${expirando.length} notificações de vencimento enviadas`);
    } catch (err) {
      logger.error({ err }, 'Erro ao notificar vencimento de carteirinhas');
    }
  });
}
