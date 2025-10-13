import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as rotaPontosController from "./rotaPontos.controller.js";
import { validate } from "../../middleware/validate.js";
import * as rotaPontosSchema from "./rotaPontos.schema.js";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   - name: RotaPontos
 *     description: Pontos vinculados às rotas
 */

/**
 * @swagger
 * /rota-pontos/{rotaId}/pontos:
 *   get:
 *     summary: Lista pontos de uma rota
 *     tags:
 *       - RotaPontos
 *     security:
 *       - bearerAuth: []
 */
// Listar pontos de uma rota
router.get(
  "/:rotaId/pontos",
  requireAuth,
  validate(rotaPontosSchema.rotaIdParamsSchema, "params"),
  rotaPontosController.listByRotaController
);

/**
 * @swagger
 * /rota-pontos/{rotaId}/pontos/ordem:
 *   put:
 *     summary: Atualiza ordem dos pontos em uma rota (admin)
 *     tags:
 *       - RotaPontos
 *     security:
 *       - bearerAuth: []
 */
// Atualizar ordem dos pontos
router.put(
  "/:rotaId/pontos/ordem",
  requireAuth,
  requireRole("admin"),
  validate(rotaPontosSchema.rotaIdParamsSchema, "params"),
  validate(rotaPontosSchema.rotaPontosOrdemSchema),
  rotaPontosController.updateOrderController
);

/**
 * @swagger
 * /rota-pontos/{rotaId}/pontos/{pontoId}/status:
 *   patch:
 *     summary: Ativa/Inativa um ponto em uma rota (admin)
 *     tags:
 *       - RotaPontos
 *     security:
 *       - bearerAuth: []
 */
// Ativar/inativar ponto em uma rota
router.patch(
  "/:rotaId/pontos/:pontoId/status",
  requireAuth,
  requireRole("admin"),
  validate(rotaPontosSchema.rotaPontoParamsSchema),
  validate(rotaPontosSchema.pontoStatusSchema),
  rotaPontosController.setStatusController
);

/**
 * @swagger
 * /rota-pontos/{rotaId}/pontos/isOrdered:
 *   get:
 *     summary: Verifica se os pontos estão ordenados
 *     tags:
 *       - RotaPontos
 *     security:
 *       - bearerAuth: []
 */
// Verificar se os pontos estão ordenados
router.get(
  "/:rotaId/pontos/isOrdered",
  requireAuth,
  validate(rotaPontosSchema.rotaIdParamsSchema, "params"),
  rotaPontosController.isOrderedController
);

export default router;
