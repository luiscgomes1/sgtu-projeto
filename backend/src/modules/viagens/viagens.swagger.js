/**
 * @swagger
 * /viagens/hoje/alunos:
 *   get:
 *     summary: Lista alunos que confirmaram presença hoje agrupados por rota
 *     tags:
 *       - Viagens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista agrupada por rota
 *       '401':
 *         description: Não autorizado
 */

/**
 * @swagger
 * /viagens/hoje/resumo:
 *   get:
 *     summary: Resumo simples das viagens de hoje (total por rota)
 *     tags:
 *       - Viagens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Resumo das viagens
 */

/**
 * @swagger
 * /viagens/hoje/volta/status:
 *   get:
 *     summary: Status do embarque de volta (acesso temporário)
 *     tags:
 *       - Viagens
 *     responses:
 *       '200':
 *         description: Status retornado
 */

/**
 * @swagger
 * /viagens:
 *   get:
 *     summary: Lista todas as viagens (admin)
 *     tags:
 *       - Viagens
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de viagens
 *       '401':
 *         description: Não autorizado
 *       '403':
 *         description: Acesso negado
 */

/**
 * @swagger
 * /viagens/{viagemId}:
 *   get:
 *     summary: Detalha uma viagem por ID (admin)
 *     tags:
 *       - Viagens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: viagemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da viagem
 *     responses:
 *       '200':
 *         description: Dados da viagem
 *       '401':
 *         description: Não autorizado
 *       '403':
 *         description: Acesso negado
 *       '404':
 *         description: Viagem não encontrada
 */
