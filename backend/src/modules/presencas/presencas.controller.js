import { obterAluno } from '../alunos/alunos.service.js';
import { obterRotaPorFaculdade } from '../rotaFaculdades/rotaFaculdades.service.js';
import * as PresencasService from './presencas.service.js';
import { validarQRCode } from '../carteirinhas/carteirinhas.service.js';
import { ok, created, fail } from '../../utils/response.js';
import { logger } from '../../config/logger.js';

export async function listarPresencasPorRotaController(req, res, next) {
    const { rotaId } = req.params;
    const { data } = req.query;
    const presencas = await PresencasService.listarPresencasPorRota(rotaId, data);
    ok(res, presencas);
}


export async function listarPresencasPorAlunoController(req, res, next) {
    const { alunoId } = req.params;
    const presencas = await PresencasService.listarPresencasPorAluno(alunoId);
    ok(res, presencas);
}

export async function desativarPresencaController(req, res, next) {
    const { presencaId } = req.params;
    const result = await PresencasService.desativarPresenca(presencaId);
    ok(res, result);
}

export async function marcarPresencaController(req, res, next) {
    const alunoId = req.user.id;
    if(!alunoId) return fail(res, 400, 'Aluno é obrigatório');

    const aluno = await obterAluno(alunoId);

    if(!aluno.curso?.faculdadeId) return fail(res, 400, 'Aluno não está vinculado a nenhuma faculdade');

    const rotaId = await obterRotaPorFaculdade(aluno.curso.faculdadeId);

    if(!rotaId) return fail(res, 400, 'Não existe rota vinculada a faculdade do aluno');

    logger.debug({ alunoId: aluno.usuarioId }, 'ID do Aluno');

    const presenca = await PresencasService.marcarPresenca(aluno.usuarioId, rotaId);
    created(res, presenca);
}

export async function confirmarEmbarqueController(req, res, next) {
    const { token } = req.body;
    const alunoId = await validarQRCode(token);
    if(!alunoId) return fail(res, 400, 'Token inválido');
    const presenca = await PresencasService.confirmarPresencaIdaQrCode(alunoId);
    if(presenca.error) {
        return fail(res, 400, presenca.error);
    }
    ok(res, presenca);
}

export async function confirmarVoltaController(req, res, next) {
    const { token } = req.body;
    const alunoId = await validarQRCode(token);
    if(!alunoId) return fail(res, 400, 'Token inválido');
    const presenca = await PresencasService.confirmarPresencaVoltaQrCode(alunoId);
    if(presenca.error) {
        return fail(res, 400, presenca.error);
    }
    ok(res, presenca);
}