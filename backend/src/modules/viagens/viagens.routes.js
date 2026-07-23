import { Router } from "express";
import {
  requireAuth,
  requireBotAuth,
  requireRole,
} from "../../middleware/auth.js";
import * as ViagemController from "./viagens.controller.js";
import { validate } from "../../middleware/validate.js";
import * as ViagemSchema from "./viagens.schema.js";
import { requireTemporaryAccess } from "../../middleware/tempAuth.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  ViagemController.listarViagensController
);
router.get(
  "/:viagemId",
  requireAuth,
  requireRole("admin"),
  validate(ViagemSchema.viagemIdParamsSchema, "params"),
  ViagemController.detalharViagemController
);
router.get(
  "/hoje/alunos",
  requireBotAuth,
  ViagemController.listarAlunosHojeController
);
router.get(
  "/hoje/resumo",
  requireBotAuth,
  ViagemController.listarResumoViagensHojeController
);

router.get("/hoje/volta/status", requireTemporaryAccess, ViagemController.listarStatusVoltaController);

export default router;
