import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as RotaFaculdadesController from "./rotaFaculdades.controller.js";
import { validate } from "../../middleware/validate.js";
import { sanitizeData } from "../../middleware/sanitize.js";
import * as RotaFaculdadesSchema from "./rotaFaculdades.schema.js";

const router = Router();

router.get(
  "/:rotaId",
  requireAuth,
  validate(RotaFaculdadesSchema.rotaIdParamsSchema, "params"),
  RotaFaculdadesController.listarFaculdadesDaRotaController
);
router.post(
  "/vincular",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(RotaFaculdadesSchema.rotaFaculdadeBodySchema),
  RotaFaculdadesController.vincularFaculdadeController
);
router.post(
  "/desvincular",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(RotaFaculdadesSchema.rotaFaculdadeBodySchema),
  RotaFaculdadesController.desvincularFaculdadeController
);
export default router;
