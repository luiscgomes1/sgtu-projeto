import * as MotoristaService from './escalas.service.js';

export async function gerarAutomaticaController(req, res, next) {
    try {
        const { ano, motoristasIds } = req.body;

        const result = await MotoristaService.gerarEscalaAutomatica(parseInt(ano), motoristasIds);
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function gerarEscalaManualController(req, res, next) {
    try {
        const { ano, pares } = req.body;

        const result = await MotoristaService.gerarEscalaManual(parseInt(ano), pares);
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function definirManualController(req, res, next) {
    try {
        const { ano, mes, motorista1_id, motorista2_id } = req.body;

        const result = await MotoristaService.definirEscalaManual({ ano, mes, motorista1_id, motorista2_id });
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function desativarEscalaController(req, res, next) {
    try {
        const { ano, mes } = req.params;

        const result = await MotoristaService.desativarEscala(parseInt(ano), parseInt(mes));
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function getMensalController(req, res, next) {
    try {
        const { ano, mes } = req.params;

        const result = await MotoristaService.motoristasDoMes(parseInt(ano), parseInt(mes));
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function getSemanalController(req, res, next) {
    try {
        const { ano, mes, semana } = req.params;

        const result = await MotoristaService.motoristaDaSemana(
            parseInt(ano),
            parseInt(mes),
            parseInt(semana)
        );
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function listarEscalasAno(req, res, next) {
    try {
        const { ano } = req.params;

        const result = await MotoristaService.listarEscalasAnoComSemanas(parseInt(ano));
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function listarAnoController(req, res, next) {
    try {
        const { ano } = req.params;
        const result = await MotoristaService.listarMotoristasPorAno(parseInt(ano));
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function resetEscalasAnoController(req, res, next) {
    try {
        const { ano } = req.params;

        if(process.env.NODE_ENV !== 'development') {
          return res.status(403).json({ error: "Ação não permitida em produção" });
        }
        
        const result = await MotoristaService.resetEscalasAno(parseInt(ano));
        return res.json(result);
    } catch (error) {
        next(error);
    }  
}