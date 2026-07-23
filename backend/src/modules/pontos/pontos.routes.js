import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as pontosController from "./pontos.controller.js";
import { validate } from "../../middleware/validate.js";
import * as pontosSchema from "./pontos.schema.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate(pontosSchema.pontoCreateSchema),
  pontosController.createPontoController
);

router.get("/", pontosController.listPontosController);

router.get(
    "/paginated",
    validate(pontosSchema.pontoListQuerySchema, 'query'),
    pontosController.listPontosPaginatedController
);

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
  validate(pontosSchema.pontoIdParamsSchema, "params"),
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
