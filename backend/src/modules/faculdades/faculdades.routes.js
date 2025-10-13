import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as FaculdadesController from "./faculdades.controller.js";
import { validate } from "../../middleware/validate.js";
import * as FaculdadesSchema from "./faculdades.schema.js";
import Joi from "joi";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  sanitizeData,
  validate(FaculdadesSchema.faculdadeCreateSchema),
  FaculdadesController.createFaculdadeController
);

router.get("/", FaculdadesController.listFaculdadesController);

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
