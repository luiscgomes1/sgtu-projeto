import * as RotaMotoristaService from './rotaMotoristas.service.js';

export async function atribuirMotoristaController(req, res, next) {
    try {
        const { rotaId, motoristaId, inicio, fim } = req.body;

        const data = await RotaMotoristaService.atribuirMotorista(rotaId, motoristaId, inicio, fim);
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

export async function desativarMotoristaController(req, res, next) {
    try {
        const { rotaId, motoristaId } = req.body;

        const data = await RotaMotoristaService.desativarMotorista(rotaId, motoristaId);
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

export async function listarMotoristasDaRotaController(req, res, next) {
    try {
        const { rotaId } = req.params;
        
        const data = await RotaMotoristaService.listarMotoristasDaRota(rotaId);
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}