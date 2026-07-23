import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as ConfiguracoesController from "./configuracoes.controller.js";
import { validate } from "../../middleware/validate.js";
import * as ConfiguracoesSchema from "./configuracoes.schema.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  ConfiguracoesController.getConfiguracoesController
);
router.get(
  "/hora-limite",
  ConfiguracoesController.getHoraLimitePresencaController
);
router.put(
  "/hora-limite",
  requireAuth,
  requireRole("admin"),
  validate(ConfiguracoesSchema.horaLimiteUpdateSchema),
  ConfiguracoesController.updateHoraLimiteController
);
router.put(
  "/logo",
  requireAuth,
  requireRole("admin"),
  validate(ConfiguracoesSchema.logoUpdateSchema),
  ConfiguracoesController.updateLogoController
);
router.put(
  "/nome-organizacao",
  requireAuth,
  requireRole("admin"),
  validate(ConfiguracoesSchema.nomeOrganizacaoUpdateSchema),
  ConfiguracoesController.updateNomeOrganizacaoController
);

export default router;
