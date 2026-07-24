import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as ConfiguracoesController from "./configuracoes.controller.js";
import { validate } from "../../middleware/validate.js";
import * as ConfiguracoesSchema from "./configuracoes.schema.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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
router.get(
  "/horarios-viagem",
  requireAuth,
  requireRole("admin"),
  ConfiguracoesController.getHorariosViagemController
);
router.put(
  "/horarios-viagem",
  requireAuth,
  requireRole("admin"),
  validate(ConfiguracoesSchema.horariosViagemUpdateSchema),
  ConfiguracoesController.updateHorariosViagemController
);
router.post(
  "/logo/upload",
  requireAuth,
  requireRole("admin"),
  upload.single("logo"),
  ConfiguracoesController.uploadLogoController
);

export default router;
