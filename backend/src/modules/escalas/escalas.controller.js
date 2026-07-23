import { ok, created, fail } from '../../utils/response.js';
import * as EscalaService from './escalas.service.js';

export async function gerarAutomaticaController(req, res) {
    const { ano, motoristasIds } = req.body;
    const result = await EscalaService.gerarEscalaAutomatica(parseInt(ano), motoristasIds);
    return created(res, result);
}

export async function gerarEscalaManualController(req, res) {
    const { ano, distribuicao } = req.body;
    const result = await EscalaService.gerarEscalaManual(parseInt(ano), distribuicao);
    return created(res, result);
}

export async function desativarEscalaController(req, res) {
    const { ano, mes } = req.params;
    const result = await EscalaService.desativarEscala(parseInt(ano), parseInt(mes));
    return ok(res, result);
}

export async function listarEscalasAno(req, res) {
    const { ano } = req.params;
    const result = await EscalaService.listarEscalasAno(parseInt(ano));
    return ok(res, result);
}

export async function listarMotoristasDoMesController(req, res) {
    const { ano, mes } = req.params;
    const result = await EscalaService.listarMotoristasDoMes(parseInt(ano), parseInt(mes));
    return ok(res, result);
}

export async function resetEscalasAnoController(req, res) {
    const { ano } = req.params;

    if (process.env.NODE_ENV !== 'development') {
        return fail(res, 403, 'Ação não permitida em produção');
    }

    const result = await EscalaService.resetEscalasAno(parseInt(ano));
    return ok(res, result);
}
