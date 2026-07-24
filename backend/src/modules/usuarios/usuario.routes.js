import { Router } from "express";
import * as UserController from "./usuario.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as UserSchema from "./usuario.schema.js";
import rateLimit from "express-rate-limit";

const router = Router();

const senhaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de validação de senha, tente novamente em 1 minuto." },
});

router.get("/me", requireAuth, UserController.getMeController);
router.put("/me", requireAuth, validate(UserSchema.usuarioUpdateSchema), UserController.atualizarPerfilController);
router.post("/me/validar-senha", requireAuth, senhaLimiter, UserController.validarSenhaController);
router.patch("/me/senha", requireAuth, validate(UserSchema.alterarSenhaSchema), UserController.alterarSenhaController);
router.post("/me/telegram/token", requireAuth, UserController.gerarTokenTelegramController);
router.get("/me/telegram/status", requireAuth, UserController.statusTelegramController);
router.post("/me/telegram/desconectar", requireAuth, UserController.desconectarTelegramController);

export default router;
