/**
 * @swagger
 * tags:
 *   - name: AlunoPontos
 *     description: Vinculação de alunos a pontos de embarque
 */

/**
 * @swagger
 * /aluno-pontos/vincular:
 *   post:
 *     summary: Vincula um aluno a um ponto de embarque
 *     tags:
 *       - AlunoPontos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alunoId
 *               - pontoId
 *             properties:
 *               alunoId:
 *                 type: string
 *                 format: uuid
 *               pontoId:
 *                 type: string
 *                 format: uuid
 */

/**
 * @swagger
 * /aluno-pontos/desvincular:
 *   post:
 *     summary: Desvincula um aluno de um ponto de embarque
 *     tags:
 *       - AlunoPontos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alunoId
 *               - pontoId
 *             properties:
 *               alunoId:
 *                 type: string
 *                 format: uuid
 *               pontoId:
 *                 type: string
 *                 format: uuid
 */

/**
 * @swagger
 * /aluno-pontos/aluno/{alunoId}:
 *   get:
 *     summary: Lista pontos de embarque de um aluno
 *     tags:
 *       - AlunoPontos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alunoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /aluno-pontos/ponto/{pontoId}:
 *   get:
 *     summary: Lista alunos vinculados a um ponto de embarque
 *     tags:
 *       - AlunoPontos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pontoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
