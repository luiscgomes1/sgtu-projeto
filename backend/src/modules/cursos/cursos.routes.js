import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as CursosController from "./cursos.controller.js";
import { validate } from "../../middleware/validate.js";
import * as CursosSchema from "./cursos.schema.js";
import Joi from "joi";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Cursos
 *     description: Operações relacionadas a cursos
 */

/**
 * @swagger
 * /cursos/{faculdadeId}:
 *   get:
 *     summary: Lista cursos de uma faculdade
 *     tags:
 *       - Cursos
 *     parameters:
 *       - in: path
 *         name: faculdadeId
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:faculdadeId", CursosController.listCursosByFaculdadeController);

/**
 * @swagger
 * /cursos:
 *   get:
 *     summary: Lista todos os cursos
 *     tags:
 *       - Cursos
 *     responses:
 *       '200':
 *         description: Lista de cursos
 */
router.get("/", CursosController.listCursosController);

/**
 * @swagger
 * /cursos/{id}:
 *   get:
 *     summary: Obtém um curso por id
 *     tags:
 *       - Cursos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  "/:id",
  validate(CursosSchema.cursoIdParamSchema),
  CursosController.getCursoByIdController
);

/**
 * @swagger
 * /cursos:
 *   post:
 *     summary: Cria um curso (admin)
 *     tags:
 *       - Cursos
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(CursosSchema.cursoCreateSchema),
  CursosController.createCursoController
);

/**
 * @swagger
 * /cursos/{id}:
 *   put:
 *     summary: Atualiza um curso (admin)
 *     tags:
 *       - Cursos
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(CursosSchema.cursoIdParamSchema, "params"),
  sanitizeData,
  validate(CursosSchema.cursoUpdateSchema),
  CursosController.updateCursoController
);

/**
 * @swagger
 * /cursos/{id}:
 *   patch:
 *     summary: Altera status do curso (admin)
 *     tags:
 *       - Cursos
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
    validate(CursosSchema.cursoIdParamSchema, "params"),
    validate(Joi.object({ status: Joi.string().valid('ativo', 'inativo').required() })),
  CursosController.setCursoStatusController
);

export default router;
