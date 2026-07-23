import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as MotoristaController from "./motoristas.controller.js";
import { validate } from "../../middleware/validate.js";
import * as MotoristaSchema from "./motoristas.schema.js";
import { z } from "zod";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

// Apenas admin pode gerenciar motoristas
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(MotoristaSchema.motoristaCreateSchema),
  MotoristaController.createMotoristaController
);

router.get("/", requireAuth, MotoristaController.listMotoristasController);

router.get(
    "/paginated",
    requireAuth,
    validate(MotoristaSchema.motoristaListQuerySchema, 'query'),
    MotoristaController.listMotoristasPaginatedController
);

router.get(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(MotoristaSchema.motoristaIdParamsSchema, "params"),
  MotoristaController.getMotoristaByIdController
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(MotoristaSchema.motoristaIdParamsSchema, "params"),
  sanitizeData,
  validate(MotoristaSchema.motoristaUpdateSchema),
  MotoristaController.updateMotoristaController
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin"),
  validate(MotoristaSchema.motoristaIdParamsSchema, "params"),
  validate(
    z.object({ status: z.enum(["ativo", "inativo"]) })
  ),
  MotoristaController.setMotoristaStatusController
);

export default router;
