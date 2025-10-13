import express from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema } from './auth.schema.js';
import { sanitizeData } from '../../middleware/sanitize.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Login de usuários (Admin e Alunos)
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login do usuário.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@sgtu.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: minhaSenhaForte
 *     responses:
 *       '200':
 *         description: "Login bem-sucedido. Retorna token JWT e dados do usuário."
 *       '400':
 *         description: "Erro de validação de input (ex: senha muito curta)."
 *       '401':
 *         description: "Credenciais inválidas."
 */
router.post('/login', sanitizeData, validate(loginSchema), authController.loginController);

export default router;
