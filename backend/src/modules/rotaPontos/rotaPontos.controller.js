import { ok } from '../../utils/response.js';
import * as rotaPontosService from './rotaPontos.service.js';

export async function listByRotaController(req, res) {
    const { rotaId } = req.params;
    const { incluirInativos } = req.query;

    const data = await rotaPontosService.listByRota(rotaId, {
        incluirInativos: incluirInativos === 'true',
    });
    ok(res, data);
}

export async function updateOrderController(req, res) {
    const { rotaId } = req.params;
    const { ordens } = req.body;

    const data = await rotaPontosService.updateOrder(rotaId, ordens);
    ok(res, data);
}

export async function setStatusController(req, res) {
    const { rotaId, pontoId } = req.params;
    const { status } = req.body;

    const data = await rotaPontosService.setStatus(rotaId, pontoId, status);
    ok(res, data);
}

export async function isOrderedController(req, res) {
    const { rotaId } = req.params;

    const data = await rotaPontosService.isOrdered(rotaId);
    ok(res, data);
}
