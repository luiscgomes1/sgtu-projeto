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
  "/:id",
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
/**
 * @swagger
 * /viagens/hoje/alunos:
 *   get:
 *     summary: Lista alunos que confirmaram presença hoje agrupados por rota
 *     tags:
 *       - Viagens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista agrupada por rota
 *       '401':
 *         description: Não autorizado
 */
router.get(
  "/hoje/resumo",
  requireBotAuth,
  ViagemController.listarResumoViagensHojeController
);
/**
 * @swagger
 * /viagens/hoje/resumo:
 *   get:
 *     summary: Resumo simples das viagens de hoje (total por rota)
 *     tags:
 *       - Viagens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Resumo das viagens
 */

router.get("/hoje/volta/status", requireTemporaryAccess, ViagemController.listarStatusVoltaController);
/**
 * @swagger
 * /viagens/hoje/volta/status:
 *   get:
 *     summary: Status do embarque de volta (acesso temporário)
 *     tags:
 *       - Viagens
 *     responses:
 *       '200':
 *         description: Status retornado
 */

export default router;
