import express from 'express';
import * as authController from './auth.controller.js';
import * as botTokenController from './botToken.controller.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, refreshSchema } from './auth.schema.js';
import { sanitizeData } from '../../middleware/sanitize.js';

const router = express.Router();

router.post('/login', sanitizeData, validate(loginSchema), authController.loginController);
router.post('/refresh', validate(refreshSchema), authController.refreshController);
router.post('/logout', authController.logoutController);
router.post('/bot-token', sanitizeData, botTokenController.botTokenController);

export default router;
