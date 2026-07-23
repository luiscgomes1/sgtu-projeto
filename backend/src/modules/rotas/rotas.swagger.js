/**
 * @swagger
 * tags:
 *   - name: Rotas
 *     description: Gerenciamento de rotas
 */

/**
 * @swagger
 * /rotas:
 *   get:
 *     summary: Lista todas as rotas (admin)
 *     tags:
 *       - Rotas
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /rotas:
 *   post:
 *     summary: Cria uma nova rota (admin)
 *     tags:
 *       - Rotas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Rota criada com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 */

/**
 * @swagger
 * /rotas/paginated:
 *   get:
 *     summary: Lista rotas paginadas
 *     tags:
 *       - Rotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Quantidade por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtro por status
 *     responses:
 *       '200':
 *         description: Lista paginada de rotas
 *       '401':
 *         description: Não autenticado
 */

/**
 * @swagger
 * /rotas/{id}:
 *   get:
 *     summary: Obtém uma rota pelo ID
 *     tags:
 *       - Rotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Dados da rota
 *       '401':
 *         description: Não autenticado
 *       '404':
 *         description: Rota não encontrada
 */

/**
 * @swagger
 * /rotas/{id}:
 *   put:
 *     summary: Atualiza uma rota (admin)
 *     tags:
 *       - Rotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       '200':
 *         description: Rota atualizada com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 *       '404':
 *         description: Rota não encontrada
 */

/**
 * @swagger
 * /rotas/{id}/status:
 *   patch:
 *     summary: Altera o status de uma rota (admin)
 *     tags:
 *       - Rotas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Status atualizado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 *       '404':
 *         description: Rota não encontrada
 */
