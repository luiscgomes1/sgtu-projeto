import { ok, created } from '../../utils/response.js';
import * as pontoService from './pontos.service.js';

export async function createPontoController(req, res) {
    const data = await pontoService.createPonto(req.body);
    created(res, data);
}

export async function listPontosController(req, res) {
    const incluirInativos = req.query.incluirInativos === 'true';
    const data = await pontoService.listPontos({ incluirInativos });
    ok(res, data);
}

export async function listPontosPaginatedController(req, res) {
    const result = await pontoService.listPontosPaginated(req.query);
    ok(res, result);
}

export async function getPontoByIdController(req, res) {
    const { id } = req.params;
    const data = await pontoService.getPontoById(id);
    ok(res, data);
}

export async function updatePontoController(req, res) {
    const { id } = req.params;
    const data = await pontoService.updatePonto(id, req.body);
    ok(res, data);
}

export async function setPontoStatusController(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const data = await pontoService.setPontoStatus(id, status);
    ok(res, data);
}
