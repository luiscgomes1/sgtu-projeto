import { Router } from "express";
import * as CarteirinhasController from "./carteirinhas.controller.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as CarteirinhaSchema from "./carteirinhas.schema.js";
import { validate } from "../../middleware/validate.js";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

// Gerar carteirinha (apenas admin)
router.post(
  "/gerar/:alunoId",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(CarteirinhaSchema.alunoIdParamsSchema, "params"),
  CarteirinhasController.gerarCarteirinhaController
);

// Preview mockado da carteirinha — dados fictícios para testes visuais
router.get(
  "/preview-mock",
  CarteirinhasController.previewMockController
);

// Obter carteirinha ativa
router.get(
  "/minha-carteirinha/:alunoId",
  requireAuth,
  validate(CarteirinhaSchema.alunoIdParamsSchema, "params"),
  CarteirinhasController.obterCarteirinhaAtivaController
);

// Listar (reimpressão) carteirinhas de um aluno (admin ou o próprio aluno)
router.get(
  "/:alunoId",
  requireAuth,
  validate(CarteirinhaSchema.alunoIdParamsSchema, "params"),
  CarteirinhasController.listarCarteirinhasController
);

//Validar QR Code: aluno no ônibus
router.post(
  "/validar-qrcode",
  sanitizeData,
  validate(CarteirinhaSchema.validarQrCodeSchema, "body"),
  CarteirinhasController.validarQRCodeController
);

export default router;
