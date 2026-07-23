/**
 * @swagger
 * tags:
 *   - name: Escalas
 *     description: Gerenciamento de escalas de motoristas
 */

/**
 * @swagger
 * /escalas/automatica:
 *   post:
 *     summary: Gera escala automática (admin)
 *     tags:
 *       - Escalas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ano
 *               - motoristasIds
 *             properties:
 *               ano:
 *                 type: integer
 *                 example: 2026
 *               motoristasIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Lista de IDs dos motoristas (quantidade par)
 */

/**
 * @swagger
 * /escalas/manual:
 *   post:
 *     summary: Gera escala manual (admin)
 *     tags:
 *       - Escalas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ano
 *               - pares
 *             properties:
 *               ano:
 *                 type: integer
 *                 example: 2026
 *               pares:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *                   minItems: 2
 *                   maxItems: 2
 *                 description: Lista de pares de motoristas
 */

/**
 * @swagger
 * /escalas/{ano}:
 *   get:
 *     summary: Lista escalas de um ano
 *     tags:
 *       - Escalas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ano
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2099
 */

/**
 * @swagger
 * /escalas/{ano}/{mes}:
 *   get:
 *     summary: Retorna escala mensal
 *     tags:
 *       - Escalas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ano
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 */

/**
 * @swagger
 * /escalas/{ano}/{mes}/{semana}:
 *   get:
 *     summary: Retorna escala semanal
 *     tags:
 *       - Escalas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ano
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: semana
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 */

/**
 * @swagger
 * /escalas/{ano}/{mes}/desativar:
 *   patch:
 *     summary: Desativa escala de um mês (admin)
 *     tags:
 *       - Escalas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ano
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: mes
 *         required: true
 *         schema:
 *           type: integer
 */

/**
 * @swagger
 * /escalas/{ano}/reset:
 *   delete:
 *     summary: Reseta escalas de um ano (admin)
 *     tags:
 *       - Escalas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ano
 *         required: true
 *         schema:
 *           type: integer
 */
