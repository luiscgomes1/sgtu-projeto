import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import * as FaculdadesController from "./faculdades.controller.js";
import { validate } from "../../middleware/validate.js";
import * as FaculdadesSchema from "./faculdades.schema.js";
import { z } from "zod";
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
  "/paginated",
  requireAuth,
  requireRole("admin"),
  validate(FaculdadesSchema.faculdadeListQuerySchema, 'query'),
  FaculdadesController.listFaculdadesPaginatedController
);

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
    z.object({ status: z.enum(["ativo", "inativo"]) })
  ),
  FaculdadesController.setFaculdadeStatusController
);
router.get(
  "/faculdade/:nome",
  validate(FaculdadesSchema.faculdadeNomeParamsSchema, "params"),
  FaculdadesController.getFaculdadeByNameController
);

export default router;
