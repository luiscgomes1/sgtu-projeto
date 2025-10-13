import * as viagemService from './viagens.service.js';

export async function listarViagensController(req, res, next) {
    try {
        const { rotaId, data } = req.query;

        const viagens = await viagemService.listarViagens({ rotaId, data });
        res.json(viagens);
    } catch (error) {
        next(error);
    }
}

export async function detalharViagemController(req, res, next) {
    try {
        const { viagemId } = req.params;

        const viagem = await viagemService.detalharViagem(viagemId);
        res.json(viagem);
    } catch (error) {
        next(error);
    }
}

export async function listarAlunosHojeController(req, res, next) {
    try {
        const data = new Date().toISOString().split('T')[0];

        const alunosPorRota = await viagemService.listarAlunosNaViagem(data);
        res.json(alunosPorRota);
    } catch (error) {
        next(error);
    }
}

export async function listarResumoViagensHojeController(req, res, next) {
    try {
        const resumo = await viagemService.listarResumoViagensHoje();
        res.json(resumo);
    } catch (error) {
        next(error);
    }
}

export async function listarStatusVoltaController(req, res, next) {
    try {
        const data = await viagemService.listarStatusVolta();
        res.json(data);
    } catch (error) {
        next(error);
    }
}