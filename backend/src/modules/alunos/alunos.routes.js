import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as AlunoController from "./alunos.controller.js";
import * as AlunoSchema from "./alunos.schema.js";
import { validate } from "../../middleware/validate.js";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  AlunoController.listarAlunosController
);
router.get(
  "/paginated",
  requireAuth,
  requireRole("admin"),
  AlunoController.listAlunosPaginatedController
);
router.get(
  "/estatisticas",
  requireAuth,
  requireRole("admin"),
  AlunoController.obterEstatisticasController
);
router.get(
  "/counts",
  requireAuth,
  requireRole("admin"),
  AlunoController.obterContagensController
);
router.get("/me", requireAuth, AlunoController.obterMeuPerfilController);

router.get(
  "/:id",
  requireAuth,
  validate(AlunoSchema.alunoIdParamsSchema, 'params'),
  AlunoController.obterAlunoController
);

router.put(
  "/me",
  requireAuth,
  sanitizeData,
  validate(AlunoSchema.alunoUpdateSchema),
  AlunoController.atualizarAlunoController
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(AlunoSchema.alunoIdParamsSchema, 'params'),
  sanitizeData,
  validate(AlunoSchema.alunoUpdateSchema),
  AlunoController.atualizarAlunoController
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(AlunoSchema.alunoIdParamsSchema, 'params'),
  AlunoController.inativarAlunoController
);
router.post(
  "/:id/reenviar-documentos",
  requireAuth,
  validate(AlunoSchema.alunoIdParamsSchema, 'params'),
  sanitizeData,
  validate(AlunoSchema.alunoReenviarDocumentosSchema),
  AlunoController.renviarDocumentosController
);

export default router;
