import { Router } from "express";
import * as SignupRequest from "./signup.controller.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as SignupSchema from "./signup.schema.js";
import { sanitizeData } from "../../middleware/sanitize.js";

const router = Router();

router.post(
  "/request",
  sanitizeData,
  validate(SignupSchema.signupRequestSchema),
  SignupRequest.createRequestController
);

router.patch(
  "/:requestId",
  validate(SignupSchema.requestIdParamsSchema, "params"),
  validate(SignupSchema.signupUpdateDocsSchema),
  SignupRequest.updateRequestController
);

router.get("/me", requireAuth, SignupRequest.obterMeuPerfilController);

router.get(
  "/paginated",
  requireAuth,
  requireRole("admin"),
  SignupRequest.listRequestsPaginatedController
);

router.get(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(SignupSchema.requestIdParamsSchema, "params"),
  SignupRequest.getRequestByIdController
);

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  SignupRequest.listRequestsController
);

router.get(
  "/pending",
  requireAuth,
  requireRole("admin"),
  SignupRequest.listPendingController
);

router.put(
  "/:id/approve",
  requireAuth,
  requireRole("admin"),
  validate(SignupSchema.requestIdParamsSchema, "params"),
  SignupRequest.approveController
);

router.put(
  "/:id/reprove",
  requireAuth,
  requireRole("admin"),
  validate(SignupSchema.requestIdParamsSchema, "params"),
  SignupRequest.reproveController
);

router.put(
  "/:id/approve-reenvio",
  requireAuth,
  requireRole("admin"),
  validate(SignupSchema.requestIdParamsSchema, "params"),
  SignupRequest.approveReenvioController
);

export default router;
