/**
 * @swagger
 * tags:
 *   - name: Configurações
 *     description: Configurações gerais do sistema
 */

/**
 * @swagger
 * /configuracoes:
 *   get:
 *     summary: Retorna todas as configurações (admin)
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Configurações do sistema
 */

/**
 * @swagger
 * /configuracoes/hora-limite:
 *   get:
 *     summary: Retorna a hora limite para registro de presença
 *     tags:
 *       - Configurações
 *     responses:
 *       '200':
 *         description: Hora limite atual
 */

/**
 * @swagger
 * /configuracoes/hora-limite:
 *   put:
 *     summary: Atualiza a hora limite para registro de presença (admin)
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - horaLimite
 *             properties:
 *               horaLimite:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "15:00"
 *                 description: Hora no formato HH:mm
 */

/**
 * @swagger
 * /configuracoes/logo:
 *   put:
 *     summary: Atualiza a URL do logo institucional (admin)
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logoUrl:
 *                 type: string
 *                 description: URL do logo (vazio para remover)
 *     responses:
 *       '200':
 *         description: Logo atualizado
 */

/**
 * @swagger
 * /configuracoes/nome-organizacao:
 *   put:
 *     summary: Atualiza o nome da organização exibido na carteirinha (admin)
 *     tags:
 *       - Configurações
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomeOrganizacao
 *             properties:
 *               nomeOrganizacao:
 *                 type: string
 *                 example: "PREFEITURA MUNICIPAL DE PIRAJUBA"
 *     responses:
 *       '200':
 *         description: Nome atualizado
 */
