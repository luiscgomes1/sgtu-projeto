/**
 * @swagger
 * /presencas/marcar-presenca:
 *   post:
 *     summary: Marca presença do aluno autenticado
 *     tags:
 *       - Presenças
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Presença marcada com sucesso
 *       '401':
 *         description: Token inválido ou ausente
 *       '403':
 *         description: Escopo insuficiente
 */

/**
 * @swagger
 * /presencas/confirmar-embarque:
 *   post:
 *     summary: Confirma embarque via token QR
 *     tags:
 *       - Presenças
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Embarque confirmado
 *       '400':
 *         description: Token inválido
 */

/**
 * @swagger
 * /presencas/rota/{rotaId}:
 *   get:
 *     summary: Lista as presenças de uma rota (admin)
 *     tags:
 *       - Presenças
 *     parameters:
 *       - in: path
 *         name: rotaId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID da rota
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de presenças da rota
 *       '400':
 *         description: Erro de validação
 *       '401':
 *         description: Não autenticado
 *       '404':
 *         description: Rota não encontrada
 */

/**
 * @swagger
 * /presencas/aluno/{alunoId}:
 *   get:
 *     summary: Lista as presenças de um aluno (admin)
 *     tags:
 *       - Presenças
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID do aluno
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de presenças do aluno
 *       '400':
 *         description: Erro de validação
 *       '401':
 *         description: Não autenticado
 *       '404':
 *         description: Aluno não encontrado
 */

/**
 * @swagger
 * /presencas/{id}/desativar:
 *   delete:
 *     summary: Desativa uma presença (admin)
 *     tags:
 *       - Presenças
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID da presença
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Presença desativada com sucesso
 *       '400':
 *         description: Erro de validação
 *       '401':
 *         description: Não autenticado
 *       '404':
 *         description: Presença não encontrada
 */

/**
 * @swagger
 * /presencas/confirmar-volta:
 *   post:
 *     summary: Confirma a volta do aluno via token QR
 *     tags:
 *       - Presenças
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *                 description: Token do QR Code
 *     responses:
 *       '200':
 *         description: Volta confirmada com sucesso
 *       '400':
 *         description: Token inválido
 */
