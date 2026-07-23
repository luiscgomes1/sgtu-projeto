/**
 * @swagger
 * tags:
 *   - name: Cursos
 *     description: Operações relacionadas a cursos
 */

/**
 * @swagger
 * /cursos/{faculdadeId}:
 *   get:
 *     summary: Lista cursos de uma faculdade
 *     tags:
 *       - Cursos
 *     parameters:
 *       - in: path
 *         name: faculdadeId
 *         required: true
 *         schema:
 *           type: string
 */

/**
 * @swagger
 * /cursos:
 *   get:
 *     summary: Lista todos os cursos
 *     tags:
 *       - Cursos
 *     responses:
 *       '200':
 *         description: Lista de cursos
 */

/**
 * @swagger
 * /cursos/{id}:
 *   get:
 *     summary: Obtém um curso por id
 *     tags:
 *       - Cursos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */

/**
 * @swagger
 * /cursos:
 *   post:
 *     summary: Cria um curso (admin)
 *     tags:
 *       - Cursos
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /cursos/{id}:
 *   put:
 *     summary: Atualiza um curso (admin)
 *     tags:
 *       - Cursos
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /cursos/{id}:
 *   patch:
 *     summary: Altera status do curso (admin)
 *     tags:
 *       - Cursos
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /cursos/paginated:
 *   get:
 *     summary: Lista cursos paginada
 *     tags:
 *       - Cursos
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
 *         description: Busca por nome do curso
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, inativo, ""]
 *         description: Filtrar por status
 *       - in: query
 *         name: faculdade_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por faculdade
 *     responses:
 *       '200':
 *         description: Lista paginada de cursos
 *       '400':
 *         description: Erro de validação
 */
