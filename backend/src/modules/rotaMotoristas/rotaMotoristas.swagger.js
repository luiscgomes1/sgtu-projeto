/**
 * @swagger
 * tags:
 *   - name: RotaMotoristas
 *     description: Motoristas vinculados a rotas
 */

/**
 * @swagger
 * /rota-motoristas/{rotaId}:
 *   get:
 *     summary: Lista motoristas de uma rota
 *     tags:
 *       - RotaMotoristas
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /rota-motoristas/atribuir:
 *   post:
 *     summary: Atribui motorista a uma rota (admin)
 *     tags:
 *       - RotaMotoristas
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /rota-motoristas/desativar:
 *   post:
 *     summary: Desativa motorista em rota (admin)
 *     tags:
 *       - RotaMotoristas
 *     security:
 *       - bearerAuth: []
 */
