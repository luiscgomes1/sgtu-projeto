import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as FaculdadesController from "./faculdades.controller.js";
import { validate } from "../../middleware/validate.js";
import * as FaculdadesSchema from "./faculdades.schema.js";
import Joi from "joi";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Faculdades
 *     description: Gerenciamento de faculdades
 */

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(FaculdadesSchema.faculdadeCreateSchema),
  FaculdadesController.createFaculdadeController
);
/**
 * @swagger
 * /faculdades:
 *   post:
 *     summary: Cria uma faculdade (admin)
 *     tags:
 *       - Faculdades
 *     security:
 *       - bearerAuth: []
 */

router.get("/", FaculdadesController.listFaculdadesController);
/**
 * @swagger
 * /faculdades:
 *   get:
 *     summary: Lista faculdades
 *     tags:
 *       - Faculdades
 */

router.get(
  "/:id",
  validate(FaculdadesSchema.faculdadeIdParamSchema, "params"),
  FaculdadesController.getFaculdadeByIdController
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(FaculdadesSchema.faculdadeIdParamSchema, "params"),
  sanitizeData,
  validate(FaculdadesSchema.faculdadeUpdateSchema),
  FaculdadesController.updateFaculdadeController
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(FaculdadesSchema.faculdadeIdParamSchema, "params"),
  validate(
    Joi.object({ status: Joi.string().valid("ativo", "inativo").required() })
  ),
  FaculdadesController.setFaculdadeStatusController
);
router.get(
  "/faculdade/:nome",
  validate(FaculdadesSchema.faculdadeNomeParamsSchema, "params"),
  FaculdadesController.getFaculdadeByNameController
);

export default router;
