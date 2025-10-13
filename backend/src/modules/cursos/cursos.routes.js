import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as CursosController from "./cursos.controller.js";
import { validate } from "../../middleware/validate.js";
import * as CursosSchema from "./cursos.schema.js";
import Joi from "joi";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

router.get("/:faculdadeId", CursosController.listCursosByFaculdadeController);

router.get("/", CursosController.listCursosController);

router.get(
  "/:id",
  validate(CursosSchema.cursoIdParamSchema),
  CursosController.getCursoByIdController
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
    validate(Joi.object({ status: Joi.string().valid('ativo', 'inativo').required() })),
  CursosController.setCursoStatusController
);

export default router;
