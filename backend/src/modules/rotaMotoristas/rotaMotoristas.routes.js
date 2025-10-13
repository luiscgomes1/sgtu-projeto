import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as RotaMotoristasController from "./rotaMotoristas.controller.js";
import { validate } from "../../middleware/validate.js";
import * as RotaMotoristasSchema from "./rotaMotoristas.schema.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: RotaMotoristas
 *     description: Motoristas vinculados a rotas
 */

router.get(
  "/:rotaId",
  requireAuth,
  validate(RotaMotoristasSchema.rotaIdParamsSchema, "params"),
  RotaMotoristasController.listarMotoristasDaRotaController
);
/**
 * @swagger
 * /rota-motoristas/{rotaId}:
 *   get:
 *     summary: Lista motoristas de uma rota
 *     tags:
 *       - RotaMotoristas
 *     security:
 *       - bearerAuth: []
 */

router.post(
  "/atribuir",
  requireAuth,
  requireRole("admin"),
  validate(RotaMotoristasSchema.atribuirMotoristaSchema),
  RotaMotoristasController.atribuirMotoristaController
);
/**
 * @swagger
 * /rota-motoristas/atribuir:
 *   post:
 *     summary: Atribui motorista a uma rota (admin)
 *     tags:
 *       - RotaMotoristas
 *     security:
 *       - bearerAuth: []
 */

router.post(
  "/desativar",
  requireAuth,
  requireRole("admin"),
  validate(RotaMotoristasSchema.desativarMotoristaSchema),
  RotaMotoristasController.desativarMotoristaController
);
/**
 * @swagger
 * /rota-motoristas/desativar:
 *   post:
 *     summary: Desativa motorista em rota (admin)
 *     tags:
 *       - RotaMotoristas
 *     security:
 *       - bearerAuth: []
 */

export default router;
