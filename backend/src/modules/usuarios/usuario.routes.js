import { Router } from "express";
import * as UserController from "./usuario.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as UserSchema from "./usuario.schema.js";

const router = Router();

router.get("/me", requireAuth, UserController.getMeController);
router.put("/me", requireAuth, validate(UserSchema.usuarioUpdateSchema), UserController.atualizarPerfilController);
router.patch("/me/senha", requireAuth, validate(UserSchema.alterarSenhaSchema), UserController.alterarSenhaController);

export default router;
