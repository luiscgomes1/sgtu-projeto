import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as rotaPontosController from "./rotaPontos.controller.js";
import { validate } from "../../middleware/validate.js";
import * as rotaPontosSchema from "./rotaPontos.schema.js";

const router = Router({ mergeParams: true });

// Listar pontos de uma rota
router.get(
  "/:rotaId/pontos",
  requireAuth,
  validate(rotaPontosSchema.rotaIdParamsSchema, "params"),
  rotaPontosController.listByRotaController
);

// Atualizar ordem dos pontos
router.put(
  "/:rotaId/pontos/ordem",
  requireAuth,
  requireRole("admin"),
  validate(rotaPontosSchema.rotaIdParamsSchema, "params"),
  validate(rotaPontosSchema.rotaPontosOrdemSchema),
  rotaPontosController.updateOrderController
);

// Ativar/inativar ponto em uma rota
router.patch(
  "/:rotaId/pontos/:pontoId/status",
  requireAuth,
  requireRole("admin"),
  validate(rotaPontosSchema.rotaPontoParamsSchema),
  validate(rotaPontosSchema.pontoStatusSchema),
  rotaPontosController.setStatusController
);

// Verificar se os pontos estão ordenados
router.get(
  "/:rotaId/pontos/isOrdered",
  requireAuth,
  validate(rotaPontosSchema.rotaIdParamsSchema, "params"),
  rotaPontosController.isOrderedController
);

export default router;
