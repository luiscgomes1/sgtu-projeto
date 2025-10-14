import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as PresencaController from "./presencas.controller.js";
import checkCarteirinha from '../../middleware/checkCarteirinha.js';
import { validate } from "../../middleware/validate.js";
import * as PresencaSchema from "./presencas.schema.js";

const router = Router();

router.get(
  "/rota/:rotaId",
  requireAuth,
  requireRole("admin"),
  validate(PresencaSchema.rotaIdParamsSchema, "params"),
  PresencaController.listarPresencasPorRotaController
);
router.get(
  "/aluno/:alunoId",
  requireAuth,
  requireRole("admin"),
  validate(PresencaSchema.alunoIdParamsSchema, "params"),
  PresencaController.listarPresencasPorAlunoController
);

router.delete(
  "/:id/desativar",
  requireAuth,
  requireRole("admin"),
  validate(PresencaSchema.presencaIdParamsSchema, "params"),
  PresencaController.desativarPresencaController
);

router.post(
  "/marcar-presenca",
  requireAuth,
  checkCarteirinha,
  PresencaController.marcarPresencaController
);
/**
 * @swagger
 * /presencas/marcar-presenca:
 *   post:
 *     summary: Marca presença do aluno autenticado
 *     tags:
 *       - Presenças
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Presença marcada com sucesso
 *       '401':
 *         description: Token inválido ou ausente
 *       '403':
 *         description: Escopo insuficiente
 */
router.post(
  "/confirmar-embarque",
  validate(PresencaSchema.validarTokenSchema),
  PresencaController.confirmarEmbarqueController
);
/**
 * @swagger
 * /presencas/confirmar-embarque:
 *   post:
 *     summary: Confirma embarque via token QR
 *     tags:
 *       - Presenças
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Embarque confirmado
 *       '400':
 *         description: Token inválido
 */
router.post(
  "/confirmar-volta",
  validate(PresencaSchema.validarTokenSchema),
  PresencaController.confirmarVoltaController
);

export default router;

