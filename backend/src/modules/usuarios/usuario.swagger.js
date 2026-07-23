/**
 * @swagger
 * tags:
 *   - name: Usuários
 *     description: Gerenciamento de usuários e perfil
 */

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     summary: Retorna o perfil do usuário logado
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Dados do usuário
 */

/**
 * @swagger
 * /usuarios/me:
 *   put:
 *     summary: Atualiza o perfil do usuário logado
 *     tags:
 *       - Usuários
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
 *                 minLength: 3
 *                 maxLength: 100
 */

/**
 * @swagger
 * /usuarios/me/senha:
 *   patch:
 *     summary: Altera a senha do usuário logado
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senhaAtual
 *               - novaSenha
 *             properties:
 *               senhaAtual:
 *                 type: string
 *                 minLength: 5
 *               novaSenha:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       '200':
 *         description: Senha alterada com sucesso
 *       '400':
 *         description: Erro de validação
 *       '401':
 *         description: Não autorizado
 */

/**
 * @swagger
 * /usuarios/me/validar-senha:
 *   post:
 *     summary: Valida a senha atual do usuário logado
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senha
 *             properties:
 *               senha:
 *                 type: string
 *                 description: Senha atual do usuário
 *     responses:
 *       '200':
 *         description: Senha válida
 *       '400':
 *         description: Senha inválida
 *       '401':
 *         description: Não autorizado
 */

/**
 * @swagger
 * /usuarios/me/telegram/token:
 *   post:
 *     summary: Gera um token para vincular o Telegram
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Token gerado com sucesso
 *       '401':
 *         description: Não autorizado
 */

/**
 * @swagger
 * /usuarios/me/telegram/status:
 *   get:
 *     summary: Retorna o status da integração com Telegram
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Status do Telegram
 *       '401':
 *         description: Não autorizado
 */

/**
 * @swagger
 * /usuarios/me/telegram/desconectar:
 *   post:
 *     summary: Desconecta o Telegram do usuário
 *     tags:
 *       - Usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Telegram desconectado
 *       '401':
 *         description: Não autorizado
 */
