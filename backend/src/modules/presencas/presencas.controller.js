import { obterAluno } from '../alunos/alunos.service.js';
import { obterRotaPorFaculdade } from '../rotaFaculdades/rotaFaculdades.service.js';
import * as PresencasService from './presencas.service.js';
import { validarQRCode } from '../carteirinhas/carteirinhas.service.js';

export async function registrarPresencaManualController(req, res, next) {
    try {
        const { alunoId, pontoId } = req.body;

        const data = await PresencasService.registrarPresencaManual(alunoId, pontoId);
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
}

export async function listarPresencasPorRotaController(req, res, next) {
    try {
        const { rotaId } = req.params;
        const { data } = req.query;
        
        const presencas = await PresencasService.listarPresencasPorRota(rotaId, data);
        res.status(200).json(presencas);
    } catch (error) {
        next(error);
    }
}


export async function listarPresencasPorAlunoController(req, res, next) {
    try {
        const { alunoId } = req.params;
        
        const presencas = await PresencasService.listarPresencasPorAluno(alunoId);
        res.status(200).json(presencas);
    } catch (error) {
        next(error);
    }
}

export async function desativarPresencaController(req, res, next) {
    try {
        const { presencaId } = req.params;
        
        const result = await PresencasService.desativarPresenca(presencaId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function marcarPresencaController(req, res, next) {
    try {
        const alunoId = req.user.id;
        const aluno = await obterAluno(alunoId);
        
        if(!alunoId) return res.status(400).json({ error: "Aluno é obrigatório" });

        if(!aluno.cursos?.faculdade_id) return res.status(400).json({ error: "Aluno não está vinculado a nenhuma faculdade" });
        
        const rotaId = await obterRotaPorFaculdade(aluno.cursos?.faculdade_id);

        if(!rotaId) return res.status(400).json({ error: "Não existe rota vinculada a faculdade do aluno" });

        console.log("ID do Aluno: ", aluno.usuario_id);

        const presenca = await PresencasService.marcarPresenca(aluno.usuario_id, rotaId);
        res.status(201).json(presenca);
    } catch (error) {
        next(error);
    }
}

export async function confirmarEmbarqueController(req, res, next) {
    try {
        const { token } = req.body;

        const alunoId = await validarQRCode(token);
        if(!alunoId) return res.status(400).json({ error: "Token inválido" });

        const presenca = await PresencasService.confirmarPresencaIdaQrCode(alunoId);

        if(presenca.error) {
            return res.status(400).json(presenca);
        }
        res.status(200).json(presenca);

    } catch (error) {
        next(error);
    }
}

export async function confirmarVoltaController(req, res, next) {
    try {
        const { token } = req.body;

        const alunoId = await PresencasService.validarQRCode(token);
        if(!alunoId) return res.status(400).json({ error: "Token inválido" });

        const presenca = await PresencasService.confirmarPresencaVoltaQrCode(alunoId);

        if(presenca.error) {
            return res.status(400).json(presenca);
        }
        res.status(200).json(presenca);

    } catch (error) {
        next(error);
    }
}