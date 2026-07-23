import { Router } from "express";
import * as UserController from "./usuario.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as UserSchema from "./usuario.schema.js";

const router = Router();

router.get("/me", requireAuth, UserController.getMeController);
router.put("/me", requireAuth, validate(UserSchema.usuarioUpdateSchema), UserController.atualizarPerfilController);
router.post("/me/validar-senha", requireAuth, UserController.validarSenhaController);
router.patch("/me/senha", requireAuth, validate(UserSchema.alterarSenhaSchema), UserController.alterarSenhaController);
router.post("/me/telegram/token", requireAuth, UserController.gerarTokenTelegramController);
router.get("/me/telegram/status", requireAuth, UserController.statusTelegramController);
router.post("/me/telegram/desconectar", requireAuth, UserController.desconectarTelegramController);

export default router;
