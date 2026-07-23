import { ok, created } from '../../utils/response.js';
import * as RotaService from './rotas.service.js';

export async function createRotaController(req, res) {
    const { nome } = req.body;
    const data = await RotaService.createRota(nome);
    created(res, data);
}

export async function listRotasController(req, res) {
    const incluirInativas = req.query.incluirInativas === 'true';
    const data = await RotaService.listRotas({ incluirInativas });
    ok(res, data);
}

export async function listRotasPaginatedController(req, res) {
    const result = await RotaService.listRotasPaginated(req.query);
    ok(res, result);
}

export async function getRotaByIdController(req, res) {
    const id = req.params.id;
    const data = await RotaService.getRotaById(id);
    ok(res, data);
}

export async function updateRotaController(req, res) {
    const id = req.params.id;
    const { nome, status } = req.body;
    const data = await RotaService.updateRota(id, { nome, status });
    ok(res, data);
}

export async function setRotaStatusController(req, res) {
    const id = req.params.id;
    const { status } = req.body;
    const data = await RotaService.setRotaStatus(id, status);
    ok(res, data);
}
