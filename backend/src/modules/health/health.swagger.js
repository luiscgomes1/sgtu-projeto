/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Monitoramento e status do servidor
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica a saúde do servidor
 *     tags:
 *       - Health
 *     responses:
 *       '200':
 *         description: Servidor operacional
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: boolean
 *                     storage:
 *                       type: boolean
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *       '503':
 *         description: Servidor degradado (banco ou storage offline)
 */
