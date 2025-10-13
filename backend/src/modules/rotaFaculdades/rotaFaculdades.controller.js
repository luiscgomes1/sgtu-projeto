import * as RotaFaculdadeService from './rotaFaculdades.service.js';

export async function vincularFaculdadeController(req, res, next) {
    try {
        const { rotaId, faculdadeId } = req.body;
        const data = await RotaFaculdadeService.vincularFaculdade(rotaId, faculdadeId);
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
}

export async function desvincularFaculdadeController(req, res, next) {
    try {
        const { rotaId, faculdadeId } = req.body;
        const data = await RotaFaculdadeService.desvincularFaculdade(rotaId, faculdadeId);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

export async function listarFaculdadesDaRotaController(req, res, next) {
    try {
        const { rotaId } = req.params;
        const data = await RotaFaculdadeService.listarFaculdadesDaRota(rotaId);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}