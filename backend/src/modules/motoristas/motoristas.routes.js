import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as MotoristaController from "./motoristas.controller.js";
import { validate } from "../../middleware/validate.js";
import * as MotoristaSchema from "./motoristas.schema.js";
import Joi from "joi";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Motoristas
 *     description: Gestão de motoristas
 */

/**
 * @swagger
 * /motoristas:
 *   post:
 *     summary: Cria motorista (admin)
 *     tags:
 *       - Motoristas
 *     security:
 *       - bearerAuth: []
 */
// Apenas admin pode gerenciar motoristas
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(MotoristaSchema.motoristaCreateSchema),
  MotoristaController.createMotoristaController
);

/**
 * @swagger
 * /motoristas:
 *   get:
 *     summary: Lista motoristas
 *     tags:
 *       - Motoristas
 *     security:
 *       - bearerAuth: []
 */
router.get("/", requireAuth, MotoristaController.listMotoristasController);


/**
 * @swagger
 * /motoristas/{id}:
 *   get:
 *     summary: Obtém motorista por id
 *     tags:
 *       - Motoristas
 *     security:
 *       - bearerAuth: []
 */
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
    Joi.object({ status: Joi.string().valid("ativo", "inativo").required() })
  ),
  MotoristaController.setMotoristaStatusController
);

export default router;
