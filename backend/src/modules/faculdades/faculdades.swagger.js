/**
 * @swagger
 * tags:
 *   - name: Faculdades
 *     description: Gerenciamento de faculdades
 */

/**
 * @swagger
 * /faculdades:
 *   post:
 *     summary: Cria uma faculdade (admin)
 *     tags:
 *       - Faculdades
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /faculdades:
 *   get:
 *     summary: Lista faculdades
 *     tags:
 *       - Faculdades
 */

/**
 * @swagger
 * /faculdades/paginated:
 *   get:
 *     summary: Lista faculdades paginadas
 *     tags:
 *       - Faculdades
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
 *         description: Lista paginada de faculdades
 *       '401':
 *         description: Não autenticado
 */

/**
 * @swagger
 * /faculdades/{id}:
 *   get:
 *     summary: Obtém uma faculdade pelo ID
 *     tags:
 *       - Faculdades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Dados da faculdade
 *       '404':
 *         description: Faculdade não encontrada
 */

/**
 * @swagger
 * /faculdades/{id}:
 *   put:
 *     summary: Atualiza uma faculdade (admin)
 *     tags:
 *       - Faculdades
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
 *               endereco:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       '200':
 *         description: Faculdade atualizada com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 *       '404':
 *         description: Faculdade não encontrada
 */

/**
 * @swagger
 * /faculdades/{id}:
 *   patch:
 *     summary: Altera o status de uma faculdade (admin)
 *     tags:
 *       - Faculdades
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
 *         description: Faculdade não encontrada
 */

/**
 * @swagger
 * /faculdades/faculdade/{nome}:
 *   get:
 *     summary: Busca uma faculdade pelo nome
 *     tags:
 *       - Faculdades
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Dados da faculdade
 *       '404':
 *         description: Faculdade não encontrada
 */
