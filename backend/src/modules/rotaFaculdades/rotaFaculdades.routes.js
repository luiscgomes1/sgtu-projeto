import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as RotaFaculdadesController from "./rotaFaculdades.controller.js";
import { validate } from "../../middleware/validate.js";
import * as RotaFaculdadesSchema from "./rotaFaculdades.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: RotaFaculdades
 *     description: Faculdades vinculadas às rotas
 */

router.get(
  "/:rotaId",
  requireAuth,
  validate(RotaFaculdadesSchema.rotaIdParamsSchema, "params"),
  RotaFaculdadesController.listarFaculdadesDaRotaController
);
/**
 * @swagger
 * /rota-faculdades/{rotaId}:
 *   get:
 *     summary: Lista faculdades associadas a uma rota
 *     tags:
 *       - RotaFaculdades
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/vincular",
  requireAuth,
  requireRole("admin"),
  validate(RotaFaculdadesSchema.rotaFaculdadeBodySchema),
  RotaFaculdadesController.vincularFaculdadeController
);
/**
 * @swagger
 * /rota-faculdades/vincular:
 *   post:
 *     summary: Vincula faculdade a uma rota (admin)
 *     tags:
 *       - RotaFaculdades
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/desvincular",
  requireAuth,
  requireRole("admin"),
  validate(RotaFaculdadesSchema.rotaFaculdadeBodySchema),
  RotaFaculdadesController.desvincularFaculdadeController
);
/**
 * @swagger
 * /rota-faculdades/desvincular:
 *   post:
 *     summary: Desvincula faculdade de uma rota (admin)
 *     tags:
 *       - RotaFaculdades
 *     security:
 *       - bearerAuth: []
 */

export default router;
