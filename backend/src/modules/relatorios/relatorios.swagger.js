/**
 * @swagger
 * tags:
 *   - name: Relatorios
 *     description: Relatórios e exportação de dados
 */

/**
 * @swagger
 * /relatorios/presencas/rota/{rotaId}:
 *   get:
 *     summary: Relatório de presenças por rota (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: rotaId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID da rota
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200: { description: Dados de presenças da rota }
 *       401: { description: Não autorizado }
 *       403: { description: Acesso negado }
 */

/**
 * @swagger
 * /relatorios/presencas/aluno/{alunoId}:
 *   get:
 *     summary: Relatório de presenças por aluno (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do aluno
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200: { description: Dados de presenças do aluno }
 *       401: { description: Não autorizado }
 *       403: { description: Acesso negado }
 */

/**
 * @swagger
 * /relatorios/presencas/motorista/{motoristaId}:
 *   get:
 *     summary: Relatório de presenças por motorista (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: motoristaId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do motorista
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200: { description: Dados de presenças do motorista }
 *       401: { description: Não autorizado }
 *       403: { description: Acesso negado }
 */

/**
 * @swagger
 * /relatorios/presencas/faculdade/{faculdadeId}:
 *   get:
 *     summary: Relatório de presenças por faculdade (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: faculdadeId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID da faculdade
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200: { description: Dados de presenças da faculdade }
 *       401: { description: Não autorizado }
 *       403: { description: Acesso negado }
 */

/**
 * @swagger
 * /relatorios/presencas/curso/{cursoId}:
 *   get:
 *     summary: Relatório de presenças por curso (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID do curso
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200: { description: Dados de presenças do curso }
 *       401: { description: Não autorizado }
 *       403: { description: Acesso negado }
 */

/**
 * @swagger
 * /relatorios/presencas/rota/{rotaId}/excel:
 *   get:
 *     summary: Exportar presenças por rota em Excel (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: rotaId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Arquivo Excel (.xlsx)
 *         content: { application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: {} }
 */

/**
 * @swagger
 * /relatorios/presencas/aluno/{alunoId}/excel:
 *   get:
 *     summary: Exportar presenças por aluno em Excel (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Arquivo Excel (.xlsx)
 *         content: { application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: {} }
 */

/**
 * @swagger
 * /relatorios/presencas/motorista/{motoristaId}/excel:
 *   get:
 *     summary: Exportar presenças por motorista em Excel (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: motoristaId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Arquivo Excel (.xlsx)
 *         content: { application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: {} }
 */

/**
 * @swagger
 * /relatorios/presencas/faculdade/{faculdadeId}/excel:
 *   get:
 *     summary: Exportar presenças por faculdade em Excel (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: faculdadeId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Arquivo Excel (.xlsx)
 *         content: { application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: {} }
 */

/**
 * @swagger
 * /relatorios/presencas/curso/{cursoId}/excel:
 *   get:
 *     summary: Exportar presenças por curso em Excel (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: cursoId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: dataInicio
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dataFim
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Arquivo Excel (.xlsx)
 *         content: { application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: {} }
 */

/**
 * @swagger
 * /relatorios/geral:
 *   get:
 *     summary: Relatório geral com KPIs e rankings (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: KPIs e rankings }
 */

/**
 * @swagger
 * /relatorios/geral/pdf:
 *   get:
 *     summary: Exportar relatório geral em PDF (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Arquivo PDF
 *         content: { application/pdf: {} }
 */

/**
 * @swagger
 * /relatorios/geral/excel:
 *   get:
 *     summary: Exportar relatório geral em Excel (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Arquivo Excel (.xlsx)
 *         content: { application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: {} }
 */

/**
 * @swagger
 * /relatorios/completo/pdf:
 *   get:
 *     summary: Exportar relatório completo em PDF (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: dataInicial
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dataFinal
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Arquivo PDF
 *         content: { application/pdf: {} }
 */

/**
 * @swagger
 * /relatorios/completo/excel:
 *   get:
 *     summary: Exportar relatório completo em Excel (admin)
 *     tags: [Relatorios]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: dataInicial
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dataFinal
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Arquivo Excel (.xlsx)
 *         content: { application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: {} }
 */
