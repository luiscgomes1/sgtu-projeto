/**
 * @swagger
 * tags:
 *   - name: Signup
 *     description: Cadastro de alunos
 */

/**
 * @swagger
 * /signup/request:
 *   post:
 *     summary: Cria uma solicitação de cadastro de aluno
 *     tags:
 *       - Signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 minLength: 6
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
 *       '201':
 *         description: Solicitação criada com sucesso
 */

/**
 * @swagger
 * /signup/me:
 *   get:
 *     summary: Retorna o perfil do aluno logado
 *     tags:
 *       - Signup
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Dados do perfil do aluno
 */

/**
 * @swagger
 * /signup/paginated:
 *   get:
 *     summary: Lista solicitações paginadas (admin)
 *     tags:
 *       - Signup
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */

/**
 * @swagger
 * /signup:
 *   get:
 *     summary: Lista todas as solicitações de cadastro (admin)
 *     tags:
 *       - Signup
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /signup/pending:
 *   get:
 *     summary: Lista solicitações pendentes (admin)
 *     tags:
 *       - Signup
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /signup/{id}:
 *   get:
 *     summary: Obtém uma solicitação por ID (admin)
 *     tags:
 *       - Signup
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /signup/{id}:
 *   patch:
 *     summary: Atualiza documentos de uma solicitação
 *     tags:
 *       - Signup
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comprovante_matricula_url:
 *                 type: string
 *               comprovante_residencia_url:
 *                 type: string
 *               foto_url:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pendente, aprovado, reprovado]
 */

/**
 * @swagger
 * /signup/{id}/approve:
 *   put:
 *     summary: Aprova uma solicitação de cadastro (admin)
 *     tags:
 *       - Signup
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /signup/{id}/reprove:
 *   put:
 *     summary: Reprova uma solicitação de cadastro (admin)
 *     tags:
 *       - Signup
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /signup/{id}/approve-reenvio:
 *   put:
 *     summary: Aprova reenvio de documentos (admin)
 *     tags:
 *       - Signup
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
