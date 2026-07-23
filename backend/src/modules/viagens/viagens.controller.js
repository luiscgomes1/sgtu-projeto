import * as viagemService from './viagens.service.js';
import { ok } from '../../utils/response.js';

export async function listarViagensController(req, res, next) {
    const { rotaId, data } = req.query;
    const viagens = await viagemService.listarViagens({ rotaId, data });
    ok(res, viagens);
}

export async function detalharViagemController(req, res, next) {
    const { viagemId } = req.params;
    const viagem = await viagemService.detalharViagem(viagemId);
    ok(res, viagem);
}

export async function listarAlunosHojeController(req, res, next) {
    const alunosPorRota = await viagemService.listarAlunosNaViagem(new Date());
    ok(res, alunosPorRota);
}

export async function listarResumoViagensHojeController(req, res, next) {
    const resumo = await viagemService.listarResumoViagensHoje();
    ok(res, resumo);
}

export async function listarStatusVoltaController(req, res, next) {
    const data = await viagemService.listarStatusVolta();
    ok(res, data);
}