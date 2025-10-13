import express from 'express';
import * as authController from './auth.controller.js';
import * as botTokenController from './botToken.controller.js';
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
// Emite token curto para bot (usado pelo bot para auto-login)
/**
 * @swagger
 * /auth/bot-token:
 *   post:
 *     summary: Emite um token de curta duração para uso pelo bot (auto-login)
 *     tags:
 *       - Autenticação
 *     security: []
 *     parameters: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telegramId:
 *                 type: integer
 *                 example: 123456789
 *               userId:
 *                 type: string
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               scope:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["presenca","carteirinha"]
 *     responses:
 *       '200':
 *         description: Token gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       '400':
 *         description: Requisição inválida
 *       '401':
 *         description: API key inválida
 *       '404':
 *         description: Usuário não encontrado
 */
router.post('/bot-token', sanitizeData, botTokenController.botTokenController);

export default router;
