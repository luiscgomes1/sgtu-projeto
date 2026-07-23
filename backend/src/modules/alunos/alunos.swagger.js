/**
 * @swagger
 * tags:
 *   - name: Alunos
 *     description: Gestão de alunos
 */

/**
 * @swagger
 * /alunos/me:
 *   get:
 *     summary: Retorna o perfil do aluno autenticado
 *     tags:
 *       - Alunos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Perfil do aluno
 *       '401':
 *         description: Não autenticado
 */

/**
 * @swagger
 * /alunos:
 *   get:
 *     summary: Lista todos os alunos (admin)
 *     tags:
 *       - Alunos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de alunos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 */

/**
 * @swagger
 * /alunos/paginated:
 *   get:
 *     summary: Lista alunos paginados (admin)
 *     tags:
 *       - Alunos
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
 *         description: Lista paginada de alunos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 */

/**
 * @swagger
 * /alunos/estatisticas:
 *   get:
 *     summary: Obtém estatísticas dos alunos (admin)
 *     tags:
 *       - Alunos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Estatísticas dos alunos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 */

/**
 * @swagger
 * /alunos/counts:
 *   get:
 *     summary: Obtém contagens de alunos (admin)
 *     tags:
 *       - Alunos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Contagens de alunos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 */

/**
 * @swagger
 * /alunos/{id}:
 *   get:
 *     summary: Obtém um aluno pelo ID
 *     tags:
 *       - Alunos
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
 *         description: Dados do aluno
 *       '401':
 *         description: Não autenticado
 *       '404':
 *         description: Aluno não encontrado
 */

/**
 * @swagger
 * /alunos/me:
 *   put:
 *     summary: Atualiza o próprio perfil do aluno autenticado
 *     tags:
 *       - Alunos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               rg:
 *                 type: string
 *               cpf:
 *                 type: string
 *               telefone:
 *                 type: string
 *               endereco:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               tipo_sanguineo:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *     responses:
 *       '200':
 *         description: Perfil atualizado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 */

/**
 * @swagger
 * /alunos/{id}:
 *   put:
 *     summary: Atualiza um aluno (admin)
 *     tags:
 *       - Alunos
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
 *               rg:
 *                 type: string
 *               cpf:
 *                 type: string
 *               telefone:
 *                 type: string
 *               endereco:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               tipo_sanguineo:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *     responses:
 *       '200':
 *         description: Aluno atualizado com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 *       '404':
 *         description: Aluno não encontrado
 */

/**
 * @swagger
 * /alunos/{id}:
 *   patch:
 *     summary: Inativa um aluno (admin)
 *     tags:
 *       - Alunos
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
 *         description: Aluno inativado com sucesso
 *       '401':
 *         description: Não autenticado
 *       '403':
 *         description: Sem permissão de administrador
 *       '404':
 *         description: Aluno não encontrado
 */

/**
 * @swagger
 * /alunos/{id}/reenviar-documentos:
 *   post:
 *     summary: Reenvia documentos de um aluno
 *     tags:
 *       - Alunos
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
 *               - nome
 *               - email
 *               - rg
 *               - cpf
 *               - telefone
 *               - data_nascimento
 *               - endereco
 *               - tipo_sanguineo
 *               - curso_id
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               rg:
 *                 type: string
 *               cpf:
 *                 type: string
 *               telefone:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               endereco:
 *                 type: string
 *               tipo_sanguineo:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               curso_id:
 *                 type: string
 *                 format: uuid
 *               comprovante_residencia_url:
 *                 type: string
 *               comprovante_matricula_url:
 *                 type: string
 *               foto_url:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Documentos reenviados com sucesso
 *       '400':
 *         description: Dados inválidos
 *       '401':
 *         description: Não autenticado
 *       '404':
 *         description: Aluno não encontrado
 */
