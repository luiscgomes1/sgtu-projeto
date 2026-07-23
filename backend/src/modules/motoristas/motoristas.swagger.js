/**
 * @swagger
 * tags:
 *   - name: Motoristas
 *     description: Gestão de motoristas
 */

/**
 * @swagger
 * /motoristas:
 *   post:
 *     summary: Cria motorista (admin)
 *     tags:
 *       - Motoristas
 *     security:
 *       - bearerAuth: []
 *   get:
 *     summary: Lista motoristas
 *     tags:
 *       - Motoristas
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /motoristas/{id}:
 *   get:
 *     summary: Obtém motorista por id
 *     tags:
 *       - Motoristas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do motorista
 *     responses:
 *       '200':
 *         description: Dados do motorista
 *       '401':
 *         description: Não autorizado
 *       '404':
 *         description: Motorista não encontrado
 */

/**
 * @swagger
 * /motoristas/paginated:
 *   get:
 *     summary: Lista motoristas paginada
 *     tags:
 *       - Motoristas
 *     security:
 *       - bearerAuth: []
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
 *         description: Busca por nome, CPF ou telefone
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, inativo, ""]
 *         description: Filtrar por status
 *     responses:
 *       '200':
 *         description: Lista paginada de motoristas
 *       '400':
 *         description: Erro de validação
 *       '401':
 *         description: Não autorizado
 */

/**
 * @swagger
 * /motoristas/{id}:
 *   put:
 *     summary: Atualiza um motorista (admin)
 *     tags:
 *       - Motoristas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do motorista
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
 *               cpf:
 *                 type: string
 *                 description: CPF com 11 dígitos (apenas números)
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               telefone:
 *                 type: string
 *               cnh:
 *                 type: string
 *               validade_cnh:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       '200':
 *         description: Motorista atualizado
 *       '400':
 *         description: Erro de validação
 *       '401':
 *         description: Não autorizado
 *       '404':
 *         description: Motorista não encontrado
 */

/**
 * @swagger
 * /motoristas/{id}/status:
 *   patch:
 *     summary: Altera o status de um motorista (admin)
 *     tags:
 *       - Motoristas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do motorista
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
 *         description: Motorista não encontrado
 */
