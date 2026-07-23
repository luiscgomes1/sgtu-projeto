import { Telegraf } from 'telegraf';
import { setupAlunoBot } from './aluno.js';
import { setupMotoristaBot } from './motorista.js';
import { setupAdminBot } from './admin.js';
import { setupCrons } from './cron.js';
import { setBotInstance } from './notifications.js';
import { prisma } from '../config/prisma.js';
import { setSession, clearSession, setUserCommands } from './session.js';
import { consumeTelegramLink } from '../shared/telegramLinkStore.js';
import { logger } from '../config/logger.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
setBotInstance(bot);

bot.catch((err, ctx) => {
  try {
    const username = ctx?.from?.username ?? 'unknown';
    const userId = ctx?.from?.id ?? ctx?.chat?.id ?? 'unknown';
    logger.error({ userId, username }, err?.toString?.() || err);
    if (ctx && typeof ctx.reply === 'function') {
      try {
        ctx.reply('❌ Ocorreu um erro interno. Tente novamente mais tarde.');
      } catch (e) {
        logger.warn({ err: e?.message || e }, 'bot.catch: falha ao enviar reply de erro ao usuário');
      }
    }
  } catch (e) {
    logger.error({ err: e?.message || e }, 'bot.catch: erro ao processar erro do bot');
  }
});

bot.start(async (ctx) => {
  const token = ctx.payload?.trim();
  if (token) {
    const userId = consumeTelegramLink(token);
    if (!userId) {
      return ctx.reply('⏰ Link inválido ou expirado. Gere um novo na página do sistema.');
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, tipo: true, status: true },
    });
    if (!user) return ctx.reply('❌ Usuário não encontrado.');
    if (user.status !== 'ativo') return ctx.reply('❌ Usuário inativo no sistema.');

    await setSession(ctx.from.id, {
      userId: user.id,
      tipo: user.tipo,
      nome: user.nome,
      status: user.status,
    });

    await setUserCommands(ctx.telegram, ctx.from.id, user.tipo);

    const roles = { admin: '🛠️', motorista: '🚌' };
    return ctx.reply(
      `✅ Olá, ${user.nome}! Sua conta foi vinculada ao Telegram com sucesso.\n\n` +
      `Use / para ver os comandos disponíveis.`
    );
  }

  ctx.reply(
    `👋 Bem-vindo ao SGTU Bot!\n\n` +
    `🔑 Já tem conta? Use /login email senha\n` +
    `📱 Quer conectar pelo site? Acesse o sistema e gere um QR Code na página do seu perfil.`
  );
});

bot.command("vincular", async (ctx) => {
  const token = ctx.payload?.trim();
  if (!token) return ctx.reply('⚠️ Use: /vincular TOKEN (copie o token gerado no site)');

  const userId = consumeTelegramLink(token);
  if (!userId) return ctx.reply('⏰ Link inválido ou expirado. Gere um novo na página do sistema.');

  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, nome: true, tipo: true, status: true },
  });
  if (!user) return ctx.reply('❌ Usuário não encontrado.');
  if (user.status !== 'ativo') return ctx.reply('❌ Usuário inativo no sistema.');

  const telegramId = String(ctx.from.id);
  await setSession(telegramId, {
    userId: user.id,
    tipo: user.tipo,
    nome: user.nome,
    status: user.status,
  });

  await setUserCommands(ctx.telegram, telegramId, user.tipo);

  return ctx.reply(`✅ Olá, ${user.nome}! Sua conta foi vinculada ao Telegram com sucesso.`);
});

bot.command("logout", async (ctx) => {
  clearSession(String(ctx.from.id));
  ctx.reply("🔓 Sessão encerrada com sucesso.");
});

setupAlunoBot(bot);
setupMotoristaBot(bot);
setupAdminBot(bot);
setupCrons();

bot.launch();
logger.info('✅ Telegram bot: launched');