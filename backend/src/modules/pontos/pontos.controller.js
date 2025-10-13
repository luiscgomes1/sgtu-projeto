import * as pontoService from './pontos.service.js';

export async function createPontoController(req, res, next) {
    try {
        const { payload } = req.body;

        const data = await pontoService.createPonto(payload);
        res.status(201).json(data);

    } catch (error) {
        next(error);
    }
}

export async function listPontosController(req, res, next) {
    try {
        const incluirInativos = req.query.incluirInativos === 'true';
        const data = await pontoService.listPontos({ incluirInativos });
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function getPontoByIdController(req, res, next) {
    try {
        const { id } = req.params;

        const data = await pontoService.getPontoById(id);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function updatePontoController(req, res, next) {
    try {
        const { id } = req.params;
        const { payload } = req.body;

        const data = await pontoService.updatePonto(id, payload);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function setPontoStatusController(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const data = await pontoService.setPontoStatus(id, status);
        res.json(data);
    } catch (error) {
        next(error);
    }
}