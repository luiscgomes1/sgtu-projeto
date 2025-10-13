import * as AlunoPontoService from './alunoPontos.service.js';

export async function vincularAlunoPontoController(req, res, next) {
    try {
        const { alunoId, pontoId } = req.body;

        const result = await AlunoPontoService.vincularAlunoPonto(alunoId, pontoId);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function desvincularAlunoPontoController(req, res, next) {
    try {
        const { alunoId, pontoId } = req.body;
        
        const result = await AlunoPontoService.desvincularAlunoPonto(alunoId, pontoId);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function listarPontoDoAlunoController(req, res, next) {
    try {
        const { alunoId } = req.params;

        const result = await AlunoPontoService.listarPontoDoAluno(alunoId);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function listarAlunosDoPontoController(req, res, next) {
    try {
        const { pontoId } = req.params;
        
        const result = await AlunoPontoService.listarAlunosDoPonto(pontoId);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}