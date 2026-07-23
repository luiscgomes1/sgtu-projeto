/**
 * @swagger
 * tags:
 *   - name: RotaFaculdades
 *     description: Faculdades vinculadas às rotas
 */

/**
 * @swagger
 * /rota-faculdades/{rotaId}:
 *   get:
 *     summary: Lista faculdades associadas a uma rota
 *     tags:
 *       - RotaFaculdades
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /rota-faculdades/vincular:
 *   post:
 *     summary: Vincula faculdade a uma rota (admin)
 *     tags:
 *       - RotaFaculdades
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /rota-faculdades/desvincular:
 *   post:
 *     summary: Desvincula faculdade de uma rota (admin)
 *     tags:
 *       - RotaFaculdades
 *     security:
 *       - bearerAuth: []
 */
