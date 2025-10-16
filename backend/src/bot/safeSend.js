function isBlockedError(err) {
  if (!err) return false;
  const code = err?.response?.statusCode ?? err?.code;
  const description = err?.response?.body?.description ?? err?.description ?? '';
  return code === 403 || /blocked|forbidden/i.test(description);
}

export async function safeSend(telegram, method, chatId, ...args) {
  try {
    if (!telegram || typeof telegram[method] !== 'function') {
      console.warn('safeSend: método inválido ou telegram não inicializado:', method);
      return null;
    }
    return await telegram[method](chatId, ...args);
  } catch (err) {
    try {
      if (isBlockedError(err)) {
        console.warn(`safeSend: chat ${chatId} provavelmente bloqueou o bot (403). Mensagem ignorada.`);
        return null;
      }
      console.error('safeSend: erro ao enviar mensagem para chat', chatId, err?.response?.statusCode ?? err?.code, err?.message || err);
    } catch (e) {
      console.error('safeSend: erro ao processar erro', e);
    }
    return null;
  }
}

export { isBlockedError };
