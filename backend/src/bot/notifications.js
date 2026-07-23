import { logger } from '../config/logger.js';

let botInstance = null;

export function setBotInstance(bot) {
  botInstance = bot;
}

function canNotify() {
  return botInstance && process.env.TELEGRAM_BOT_TOKEN;
}

export async function notifyUser(telegramId, message) {
  if (!telegramId || !canNotify()) return false;
  try {
    await botInstance.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    return true;
  } catch (err) {
    if (err?.response?.statusCode === 403) {
      logger.warn({ telegramId }, 'notifyUser: usuário bloqueou o bot');
    } else {
      logger.error({ telegramId, err: err.message }, 'notifyUser: erro ao enviar notificação');
    }
    return false;
  }
}

export async function notifySignupApproved(telegramId, nome) {
  return notifyUser(telegramId,
    `🎉 *Cadastro Aprovado!*\n\nOlá ${nome}, seu cadastro foi aprovado! Agora você já pode acessar o sistema e emitir sua carteirinha.`);
}

export async function notifySignupReproved(telegramId, nome) {
  return notifyUser(telegramId,
    `❌ *Cadastro Reprovado*\n\nOlá ${nome}, infelizmente seu cadastro foi reprovado. Entre em contato com o administrador para mais informações.`);
}

export async function notifyReenvioApproved(telegramId, nome) {
  return notifyUser(telegramId,
    `✅ *Documentos Atualizados!*\n\nOlá ${nome}, seus novos documentos foram aprovados.`);
}

export async function notifyCarteirinhaExpiring(telegramId, nome, dataValidade) {
  return notifyUser(telegramId,
    `⚠️ *Carteirinha Próximo do Vencimento*\n\nOlá ${nome}, sua carteirinha universitária vence em ${dataValidade}. Não se esqueça de renová-la!`);
}
