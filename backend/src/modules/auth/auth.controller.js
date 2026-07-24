import * as AuthService from "./auth.service.js";
import { refreshAccessToken, revokeRefreshToken } from "./refreshToken.service.js";
import { ok } from "../../utils/response.js";

const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const BOT_CLIENT_HEADER = (process.env.BOT_CLIENT_HEADER || 'x-bot-client').toLowerCase();

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge,
  };
}

export async function loginController(req, res, next) {
    const { email, senha } = req.body;

    const { accessToken, refreshToken, expiresAt, user } = await AuthService.login({ email, senha });

    const isBotClient = req.headers[BOT_CLIENT_HEADER] === "true";

    if (isBotClient) {
      return ok(res, { accessToken, refreshToken, expiresAt, user });
    }

    res.cookie("jwt", accessToken, cookieOptions(COOKIE_MAX_AGE));
    res.cookie("refreshToken", refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));

    ok(res, { user, accessToken, refreshToken, expiresAt });
}

export async function refreshController(req, res, next) {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token é obrigatório' });
    }

    const tokens = await refreshAccessToken(refreshToken);

    res.cookie("jwt", tokens.accessToken, cookieOptions(COOKIE_MAX_AGE));
    res.cookie("refreshToken", tokens.refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE));

    ok(res, { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: tokens.expiresAt });
}

export async function logoutController(req, res, next) {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.clearCookie("jwt");
    res.clearCookie("refreshToken");
    ok(res, { message: 'Sessão encerrada' });
}
