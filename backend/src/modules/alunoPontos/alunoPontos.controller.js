import { ok, created } from '../../utils/response.js';
import * as AlunoPontoService from './alunoPontos.service.js';

export async function vincularAlunoPontoController(req, res) {
    const { alunoId, pontoId } = req.body;
    const result = await AlunoPontoService.vincularAlunoPonto(alunoId, pontoId);
    return ok(res, result);
}

export async function desvincularAlunoPontoController(req, res) {
    const { alunoId, pontoId } = req.body;
    const result = await AlunoPontoService.desvincularAlunoPonto(alunoId, pontoId);
    return ok(res, result);
}

export async function listarPontoDoAlunoController(req, res) {
    const { alunoId } = req.params;
    const result = await AlunoPontoService.listarPontoDoAluno(alunoId);
    return ok(res, result);
}

export async function listarAlunosDoPontoController(req, res) {
    const { pontoId } = req.params;
    const result = await AlunoPontoService.listarAlunosDoPonto(pontoId);
    return ok(res, result);
}
