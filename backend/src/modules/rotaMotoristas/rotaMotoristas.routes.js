import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as RotaMotoristasController from "./rotaMotoristas.controller.js";
import { validate } from "../../middleware/validate.js";
import { sanitizeData } from "../../middleware/sanitize.js";
import * as RotaMotoristasSchema from "./rotaMotoristas.schema.js";

const router = Router();

router.get(
  "/:rotaId",
  requireAuth,
  requireRole("admin"),
  validate(RotaMotoristasSchema.rotaIdParamsSchema, "params"),
  RotaMotoristasController.listarMotoristasDaRotaController
);
router.post(
  "/atribuir",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(RotaMotoristasSchema.atribuirMotoristaSchema),
  RotaMotoristasController.atribuirMotoristaController
);
router.post(
  "/desativar",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(RotaMotoristasSchema.desativarMotoristaSchema),
  RotaMotoristasController.desativarMotoristaController
);
export default router;
