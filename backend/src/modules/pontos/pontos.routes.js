import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as pontosController from "./pontos.controller.js";
import { validate } from "../../middleware/validate.js";
import * as pontosSchema from "./pontos.schema.js";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   - name: Pontos
 *     description: Pontos de embarque e gerenciamento
 */

/**
 * @swagger
 * /pontos:
 *   post:
 *     summary: Cria um ponto (admin)
 *     tags:
 *       - Pontos
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate(pontosSchema.pontoCreateSchema),
  pontosController.createPontoController
);

/**
 * @swagger
 * /pontos:
 *   get:
 *     summary: Lista pontos
 *     tags:
 *       - Pontos
 */
router.get("/", pontosController.listPontosController);

router.get(
  "/detalhe/:id",
  requireAuth,
  validate(pontosSchema.pontoIdParamsSchema, "params"),
  pontosController.getPontoByIdController
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(pontosSchema.pontoUpdateSchema, "params"),
  validate(pontosSchema.pontoUpdateSchema),
  pontosController.updatePontoController
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin"),
  validate(pontosSchema.pontoIdParamsSchema, "params"),
  validate(pontosSchema.pontoStatusSchema),
  pontosController.setPontoStatusController
);
export default router;
