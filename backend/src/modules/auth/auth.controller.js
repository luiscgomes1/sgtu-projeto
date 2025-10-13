import * as AuthService from "./auth.service.js";
import { normalizarUsuario } from "../../utils/functions.js";

const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000; // 8 horas
const BOT_CLIENT_HEADER = process.env.BOT_CLIENT_HEADER;

export async function loginController(req, res, next) {
  try {
    const { email, senha } = req.body;

    const { token, user } = await AuthService.login({ email, senha });

    const isBotClient =
      req.headers[BOT_CLIENT_HEADER.toLocaleLowerCase()] === "true";

    if (isBotClient) {
      return res.json({ token, user: normalizarUsuario(user) });
    } else {
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: COOKIE_MAX_AGE,
      });

      res.json({ user: normalizarUsuario(user) });
    }
  } catch (error) {
    next(error);
  }
}
