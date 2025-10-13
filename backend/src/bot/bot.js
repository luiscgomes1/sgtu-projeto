import { Telegraf } from 'telegraf';
import { setupAlunoBot } from './aluno.js';
import { setupMotoristaBot } from './motorista.js';
import { setupAdminBot } from './admin.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.catch((err, ctx) => {
  console.error(`[BOT ERROR] Erro para @${ctx.from.username} (${ctx.from.id}):`, err);
  ctx.reply('❌ Ocorreu um erro interno. Tente novamente mais tarde.');
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