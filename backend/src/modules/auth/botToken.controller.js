import * as BotTokenService from './botToken.service.js';

const BOT_API_KEY = process.env.BOT_API_KEY;

export async function botTokenController(req, res, next) {
  try {
    const receivedKey = req.headers['x-bot-api-key'];
    if (!BOT_API_KEY || receivedKey !== BOT_API_KEY) {
      return res.status(401).json({ error: 'API key inválida para emissão de token de bot.' });
    }

    const { telegramId, userId } = req.body || {};
    if (!telegramId && !userId) {
      return res.status(400).json({ error: 'Informe telegramId ou userId.' });
    }

    let result = null;
    if (telegramId) {
      result = await BotTokenService.generateBotTokenForTelegramId(telegramId, { scope: req.body.scope });
    } else if (userId) {
      result = await BotTokenService.generateBotTokenForUserId(userId, { scope: req.body.scope });
    }

    if (!result) return res.status(404).json({ error: 'Usuário não encontrado para o identificador informado.' });

    return res.json({ token: result.token, user: result.user });
  } catch (err) {
    next(err);
  }
}
