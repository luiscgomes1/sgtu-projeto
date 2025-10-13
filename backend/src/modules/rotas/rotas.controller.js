import * as RotaService from './rotas.service.js';

export async function createRotaController(req, res, next) {
    try {
        const { nome } = req.body;
        
        const data = await RotaService.createRota(nome);
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
}

export async function listRotasController(req, res, next) {
    try {
        const incluirInativas = req.query.incluirInativas === 'true';
        const data = await RotaService.listRotas({ incluirInativas });
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function getRotaByIdController(req, res, next) {
    try {
        const id = req.params.id;
        const data = await RotaService.getRotaById(id);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function updateRotaController(req, res, next) {
    try {
        const id = req.params.id;
        const { nome, status } = req.body;
        
        const data = await RotaService.updateRota(id, { nome, status });
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function setRotaStatusController(req, res, next) {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const data = await RotaService.setRotaStatus(id, status);
        res.json(data);
    } catch (error) {
        next(error);
    }
}