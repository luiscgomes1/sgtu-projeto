import * as motoristaService from './motoristas.service.js';

export async function createMotoristaController(req, res, next) {
    try {

        const { nome, cpf, cnh, validade_cnh, telefone } = req.body;
        const motorista = { nome, cpf, cnh, validade_cnh, telefone };

        const data = await motoristaService.createMotorista(motorista);
        res.status(201).json(data);
        
    } catch (error) {
        next(error);
    }
}

export async function listMotoristasController(req, res, next) {
    try {
        const data = await motoristaService.listMotoristas();
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function getMotoristaByIdController(req, res, next) {
    try {
        const id = req.params.id;

        const data = await motoristaService.getMotoristaById(id);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function updateMotoristaController(req, res, next) {
    try {
        const id = req.params.id;
        const { nome, cpf, cnh, validade_cnh, data_nascimento, telefone } = req.body;
        const motorista = { nome, cpf, cnh, validade_cnh, data_nascimento, telefone };

        const data = await motoristaService.updateMotorista(id, motorista);
        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function setMotoristaStatusController(req, res, next) {
    try {
        const id = req.params.id;
        const { status } = req.body;
        
        const data = await motoristaService.setMotoristaStatus(id, status);
        res.json(data);
    } catch (error) {
        next(error);
    }
}