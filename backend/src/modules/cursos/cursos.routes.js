import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as CursosController from "./cursos.controller.js";
import { validate } from "../../middleware/validate.js";
import * as CursosSchema from "./cursos.schema.js";
import { z } from "zod";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

router.get("/paginated", 
    validate(CursosSchema.cursoListQuerySchema, 'query'),
    CursosController.listCursosPaginatedController
);

router.get("/", CursosController.listCursosController);

router.get(
  "/:id",
  validate(CursosSchema.cursoIdParamSchema, "params"),
  CursosController.getCursoByIdController
);

router.get(
  "/faculdade/:faculdadeId",
  validate(CursosSchema.faculdadeIdParamSchema, "params"),
  CursosController.listCursosByFaculdadeController
);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(CursosSchema.cursoCreateSchema),
  CursosController.createCursoController
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(CursosSchema.cursoIdParamSchema, "params"),
  sanitizeData,
  validate(CursosSchema.cursoUpdateSchema),
  CursosController.updateCursoController
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
    validate(CursosSchema.cursoIdParamSchema, "params"),
    validate(z.object({ status: z.enum(['ativo', 'inativo']) })),
  CursosController.setCursoStatusController
);

export default router;
