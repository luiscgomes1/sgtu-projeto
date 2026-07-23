/**
 * @swagger
 * /carteirinhas/minha-carteirinha/{alunoId}:
 *   get:
 *     summary: Obtém a carteirinha ativa de um aluno (requer autenticação)
 *     tags:
 *       - Carteirinhas
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do aluno
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Retorna a lista de carteirinhas (ou a carteirinha ativa)
 *       '401':
 *         description: Não autenticado
 */

/**
 * @swagger
 * /carteirinhas/gerar/{alunoId}:
 *   post:
 *     summary: Gera uma nova carteirinha para um aluno (admin)
 *     tags:
 *       - Carteirinhas
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
 *         description: Carteirinha gerada com sucesso
 *       '400':
 *         description: Erro de validação
 *       '401':
 *         description: Não autenticado
 *       '404':
 *         description: Aluno não encontrado
 */

/**
 * @swagger
 * /carteirinhas/preview-mock:
 *   get:
 *     summary: Retorna um preview mockado da carteirinha para testes visuais
 *     tags:
 *       - Carteirinhas
 *     responses:
 *       '200':
 *         description: Dados mockados da carteirinha
 */

/**
 * @swagger
 * /carteirinhas/{alunoId}:
 *   get:
 *     summary: Lista as carteirinhas de um aluno (admin ou o próprio aluno)
 *     tags:
 *       - Carteirinhas
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
 *         description: Lista de carteirinhas do aluno
 *       '401':
 *         description: Não autenticado
 *       '404':
 *         description: Aluno não encontrado
 */

/**
 * @swagger
 * /carteirinhas/validar-qrcode:
 *   post:
 *     summary: Valida o QR Code da carteirinha no embarque do ônibus
 *     tags:
 *       - Carteirinhas
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
 *         description: QR Code validado com sucesso
 *       '400':
 *         description: Token inválido
 *       '404':
 *         description: Carteirinha não encontrada
 */
