/**
 * @swagger
 * tags:
 *   - name: Pontos
 *     description: Pontos de embarque e gerenciamento
 */

/**
 * @swagger
 * /pontos:
 *   post:
 *     summary: Cria um ponto (admin)
 *     tags:
 *       - Pontos
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Lista pontos
 *     tags:
 *       - Pontos
 */

/**
 * @swagger
 * /pontos/paginated:
 *   get:
 *     summary: Lista pontos paginada
 *     tags:
 *       - Pontos
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Limite de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome ou endereço
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, inativo, ""]
 *         description: Filtrar por status
 *     responses:
 *       '200':
 *         description: Lista paginada de pontos
 *       '400':
 *         description: Erro de validação
 */

/**
 * @swagger
 * /pontos/detalhe/{id}:
 *   get:
 *     summary: Obtém detalhes de um ponto
 *     tags:
 *       - Pontos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do ponto
 *     responses:
 *       '200':
 *         description: Dados do ponto
 *       '401':
 *         description: Não autorizado
 *       '404':
 *         description: Ponto não encontrado
 */

/**
 * @swagger
 * /pontos/{id}:
 *   put:
 *     summary: Atualiza um ponto (admin)
 *     tags:
 *       - Pontos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do ponto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               endereco:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       '200':
 *         description: Ponto atualizado
 *       '400':
 *         description: Erro de validação
 *       '401':
 *         description: Não autorizado
 *       '404':
 *         description: Ponto não encontrado
 */

/**
 * @swagger
 * /pontos/{id}/status:
 *   patch:
 *     summary: Altera o status de um ponto (admin)
 *     tags:
 *       - Pontos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do ponto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       '200':
 *         description: Status alterado
 *       '400':
 *         description: Erro de validação
 *       '401':
 *         description: Não autorizado
 *       '404':
 *         description: Ponto não encontrado
 */
