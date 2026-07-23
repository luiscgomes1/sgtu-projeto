import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as PresencaController from "./presencas.controller.js";
import checkCarteirinha from '../../middleware/checkCarteirinha.js';
import { validate } from "../../middleware/validate.js";
import * as PresencaSchema from "./presencas.schema.js";
import { publicLimiter } from "../../middleware/rateLimit.js";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

router.get(
  "/rota/:rotaId",
  requireAuth,
  requireRole("admin"),
  validate(PresencaSchema.rotaIdParamsSchema, "params"),
  PresencaController.listarPresencasPorRotaController
);
router.get(
  "/aluno/:alunoId",
  requireAuth,
  requireRole("admin"),
  validate(PresencaSchema.alunoIdParamsSchema, "params"),
  PresencaController.listarPresencasPorAlunoController
);

router.delete(
  "/:presencaId/desativar",
  requireAuth,
  requireRole("admin"),
  validate(PresencaSchema.presencaIdParamsSchema, "params"),
  PresencaController.desativarPresencaController
);

router.post(
  "/marcar-presenca",
  requireAuth,
  sanitizeData,
  checkCarteirinha,
  PresencaController.marcarPresencaController
);
router.post(
  "/confirmar-embarque",
  publicLimiter,
  sanitizeData,
  validate(PresencaSchema.validarTokenSchema),
  PresencaController.confirmarEmbarqueController
);

router.post(
  "/confirmar-volta",
  publicLimiter,
  sanitizeData,
  validate(PresencaSchema.validarTokenSchema),
  PresencaController.confirmarVoltaController
);

export default router;

