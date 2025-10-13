import { Router } from "express";
import * as CarteirinhasController from "./carteirinhas.controller.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as CarteirinhaSchema from "./carteirinhas.schema.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

// Gerar carteirinha (apenas admin)
router.post(
  "/gerar/:alunoId",
  requireAuth,
  requireRole("admin"),
  validate(CarteirinhaSchema.alunoIdParamsSchema, "params"),
  CarteirinhasController.gerarCarteirinhaController
);

// Listar (reimpressão) carteirinhas de um aluno (admin ou o próprio aluno)
router.get(
  "/:alunoId",
  requireAuth,
  validate(CarteirinhaSchema.alunoIdParamsSchema, "params"),
  CarteirinhasController.listarCarteirinhasController
);

// Obter carteirinha ativa
router.get(
  "/minha-carteirinha/:alunoId",
  requireAuth,
  validate(CarteirinhaSchema.alunoIdParamsSchema, "params"),
  CarteirinhasController.obterCarteirinhaAtivaController
);
/**
 * @swagger
 * /carteirinhas/minha-carteirinha/{alunoId}:
 *   get:
 *     summary: Obtém a carteirinha ativa de um aluno (requer autenticação)
 *     tags:
 *       - Carteirinhas
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do aluno
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Retorna a lista de carteirinhas (ou a carteirinha ativa)
 *       '401':
 *         description: Não autenticado
 */

//Validar QR Code: aluno no ônibus
router.post(
  "/validar-qrcode",
  validate(CarteirinhaSchema.validarQrCodeSchema, "body"),
  CarteirinhasController.validarQRCodeController
);

export default router;
