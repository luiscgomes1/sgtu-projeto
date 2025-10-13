import { Router } from "express";
import * as RotaController from "./rotas.controller.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as RotasSchema from "./rotas.schema.js";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Rotas
 *     description: Gerenciamento de rotas
 */

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(RotasSchema.rotaCreateSchema),
  RotaController.createRotaController
);

router.get("/", requireAuth, RotaController.listRotasController);
/**
 * @swagger
 * /rotas:
 *   get:
 *     summary: Lista todas as rotas (admin)
 *     tags:
 *       - Rotas
 *     security:
 *       - bearerAuth: []
 */

router.get(
    "/:id", 
    requireAuth,
    validate(RotasSchema.rotaIdParamSchema, "params"),
    RotaController.getRotaByIdController);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(RotasSchema.rotaIdParamSchema, "params"),
  sanitizeData,
  validate(RotasSchema.rotaUpdateSchema),
  RotaController.updateRotaController
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin"),
  validate(RotasSchema.rotaIdParamSchema, "params"),
  validate(RotasSchema.rotaStatusSchema),
  RotaController.setRotaStatusController
);

export default router;
