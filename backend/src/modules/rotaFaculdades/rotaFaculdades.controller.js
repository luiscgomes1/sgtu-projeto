import { ok, created } from '../../utils/response.js';
import * as RotaFaculdadeService from './rotaFaculdades.service.js';

export async function vincularFaculdadeController(req, res) {
    const { rotaId, faculdadeId } = req.body;
    const data = await RotaFaculdadeService.vincularFaculdade(rotaId, faculdadeId);
    created(res, data);
}

export async function desvincularFaculdadeController(req, res) {
    const { rotaId, faculdadeId } = req.body;
    const data = await RotaFaculdadeService.desvincularFaculdade(rotaId, faculdadeId);
    return ok(res, data);
}

export async function listarFaculdadesDaRotaController(req, res) {
    const { rotaId } = req.params;
    const data = await RotaFaculdadeService.listarFaculdadesDaRota(rotaId);
    return ok(res, data);
}
