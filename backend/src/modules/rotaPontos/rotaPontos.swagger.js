/**
 * @swagger
 * tags:
 *   - name: RotaPontos
 *     description: Pontos vinculados às rotas
 */

/**
 * @swagger
 * /rota-pontos/{rotaId}/pontos:
 *   get:
 *     summary: Lista pontos de uma rota
 *     tags:
 *       - RotaPontos
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /rota-pontos/{rotaId}/pontos/ordem:
 *   put:
 *     summary: Atualiza ordem dos pontos em uma rota (admin)
 *     tags:
 *       - RotaPontos
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /rota-pontos/{rotaId}/pontos/{pontoId}/status:
 *   patch:
 *     summary: Ativa/Inativa um ponto em uma rota (admin)
 *     tags:
 *       - RotaPontos
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /rota-pontos/{rotaId}/pontos/isOrdered:
 *   get:
 *     summary: Verifica se os pontos estão ordenados
 *     tags:
 *       - RotaPontos
 *     security:
 *       - bearerAuth: []
 */
