import * as ConfiguracoesService from '../configuracoes/configuracoes.service.js';

export async function getConfiguracoesController(req, res, next) {
    try {
        const configuracao = await ConfiguracoesService.getConfiguracao();
        res.json(configuracao);
    } catch (error) {
        next(error);
    }
}

export async function updateHoraLimiteController(req, res, next) {
    try {
        const { hora } = req.body;

        const updated = await ConfiguracoesService.updateHoraLimite(hora);
        res.json(updated);
    } catch (error) {
        next(error);
    }
}

export async function getHoraLimitePresencaController(req, res, next) {
    try {
        const horaLimite = await ConfiguracoesService.gethoraLimitePresenca();
        res.json({ hora_limite_presenca: horaLimite });
    } catch (error) {
        next(error);
    }
}