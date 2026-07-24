import * as BotTokenService from './botToken.service.js';
import { ok, fail } from '../../utils/response.js';

const BOT_API_KEY = process.env.BOT_API_KEY;

export async function botTokenController(req, res, next) {
    const receivedKey = req.headers['x-bot-api-key'];
    if (!BOT_API_KEY || receivedKey !== BOT_API_KEY) {
      return fail(res, 401, 'API key inválida para emissão de token de bot.');
    }

    const { telegramId } = req.body || {};
    if (!telegramId) {
      return fail(res, 400, 'Informe telegramId.');
    }

    const result = await BotTokenService.generateBotTokenForTelegramId(telegramId, { scope: req.body.scope });
    if (!result) return fail(res, 404, 'Usuário não encontrado para o identificador informado.');

    return ok(res, { token: result.token, user: result.user });
}
