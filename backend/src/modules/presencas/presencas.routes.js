import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as PresencaController from "./presencas.controller.js";
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
  PresencaController.marcarPresencaController
);
router.post(
  "/confirmar-embarque",
  validate(PresencaSchema.validarTokenSchema),
  PresencaController.confirmarEmbarqueController
);
router.post(
  "/confirmar-volta",
  validate(PresencaSchema.validarTokenSchema),
  PresencaController.confirmarVoltaController
);

export default router;
