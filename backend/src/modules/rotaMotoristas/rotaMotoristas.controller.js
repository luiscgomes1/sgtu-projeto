import { ok } from '../../utils/response.js';
import * as RotaMotoristaService from './rotaMotoristas.service.js';

export async function atribuirMotoristaController(req, res) {
    const { rotaId, motoristaId, inicio, fim } = req.body;
    const data = await RotaMotoristaService.atribuirMotorista(rotaId, motoristaId, inicio, fim);
    return ok(res, data);
}

export async function desativarMotoristaController(req, res) {
    const { rotaId, motoristaId } = req.body;
    const data = await RotaMotoristaService.desativarMotorista(rotaId, motoristaId);
    return ok(res, data);
}

export async function listarMotoristasDaRotaController(req, res) {
    const { rotaId } = req.params;
    const data = await RotaMotoristaService.listarMotoristasDaRota(rotaId);
    return ok(res, data);
}
