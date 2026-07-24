import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as EscalaController from "./escalas.controller.js";
import { validate } from "../../middleware/validate.js";
import { sanitizeData } from "../../middleware/sanitize.js";
import * as EscalaSchema from "./escalas.schema.js";

const router = Router();

router.post(
  "/automatica",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(EscalaSchema.gerarAutomaticaSchema),
  EscalaController.gerarAutomaticaController
);

router.post(
  "/manual",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(EscalaSchema.gerarManualSchema),
  EscalaController.gerarEscalaManualController
);

router.get(
  "/:ano",
  requireAuth,
  requireRole("admin"),
  validate(EscalaSchema.anoParamsSchema, "params"),
  EscalaController.listarEscalasAno
);

router.get(
  "/:ano/:mes",
  requireAuth,
  requireRole("admin"),
  validate(EscalaSchema.anoMesParamsSchema, "params"),
  EscalaController.listarMotoristasDoMesController
);

router.patch(
  "/:ano/:mes/desativar",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(EscalaSchema.anoMesParamsSchema, "params"),
  EscalaController.desativarEscalaController
);

router.delete(
  "/:ano/reset",
  requireAuth,
  requireRole("admin"),
  validate(EscalaSchema.anoParamsSchema, "params"),
  EscalaController.resetEscalasAnoController
);

export default router;
