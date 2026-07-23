import { logger } from '../config/logger.js';

function isBlockedError(err) {
  if (!err) return false;
  const code = err?.response?.statusCode ?? err?.code;
  const description = err?.response?.body?.description ?? err?.description ?? '';
  return code === 403 || /blocked|forbidden/i.test(description);
}

export async function safeSend(telegram, method, chatId, ...args) {
  try {
    if (!telegram || typeof telegram[method] !== 'function') {
      logger.warn({ method }, 'safeSend: método inválido ou telegram não inicializado');
      return null;
    }
    return await telegram[method](chatId, ...args);
  } catch (err) {
    try {
      if (isBlockedError(err)) {
        logger.warn({ chatId }, 'safeSend: chat provavelmente bloqueou o bot (403). Mensagem ignorada.');
        return null;
      }
      logger.error({ chatId, statusCode: err?.response?.statusCode ?? err?.code, err: err?.message || err }, 'safeSend: erro ao enviar mensagem para chat');
    } catch (e) {
      logger.error({ err: e }, 'safeSend: erro ao processar erro');
    }
    return null;
  }
}

export { isBlockedError };
