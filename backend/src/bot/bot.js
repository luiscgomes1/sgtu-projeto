import { Telegraf } from 'telegraf';
import { setupAlunoBot } from './aluno.js';
import { setupMotoristaBot } from './motorista.js';
import { setupAdminBot } from './admin.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.catch((err, ctx) => {
  try {
    const username = ctx?.from?.username ?? 'unknown';
    const userId = ctx?.from?.id ?? ctx?.chat?.id ?? 'unknown';
    console.error(`[BOT ERROR] Erro para @${username} (${userId}):`, err?.toString?.() || err);
    if (ctx && typeof ctx.reply === 'function') {
      try {
        ctx.reply('❌ Ocorreu um erro interno. Tente novamente mais tarde.');
      } catch (e) {
        console.warn('bot.catch: falha ao enviar reply de erro ao usuário:', e?.message || e);
      }
    }
  } catch (e) {
    console.error('bot.catch: erro ao processar erro do bot:', e?.message || e);
  }
});

bot.start((ctx) => {
  ctx.reply(`👋Bem-vindo! Use /login em seguida seu email e senha para começar.
    \nExemplo: /login teste@email.com senha123`);
});

setupAlunoBot(bot);
setupMotoristaBot(bot);
setupAdminBot(bot);

bot.launch();
console.log('✅ Telegram bot: launched');