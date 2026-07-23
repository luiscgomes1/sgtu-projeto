import { ok, created } from '../../utils/response.js';
import * as motoristaService from './motoristas.service.js';
import { maskMotorista } from '../../utils/mask.js';

export async function createMotoristaController(req, res) {
    const { nome, cpf, cnh, data_nascimento, validade_cnh, telefone } = req.body;
    const motorista = { nome, cpf, cnh, data_nascimento, validade_cnh, telefone };
    const data = await motoristaService.createMotorista(motorista);
    created(res, data);
}

export async function listMotoristasController(req, res) {
    const data = await motoristaService.listMotoristas();
    ok(res, data.map(m => maskMotorista(m, req.user)));
}

export async function listMotoristasPaginatedController(req, res) {
    const result = await motoristaService.listMotoristasPaginated(req.query);
    result.data = result.data.map(m => maskMotorista(m, req.user));
    ok(res, result);
}

export async function getMotoristaByIdController(req, res) {
    const id = req.params.id;
    const data = await motoristaService.getMotoristaById(id);
    ok(res, maskMotorista(data, req.user));
}

export async function updateMotoristaController(req, res) {
    const id = req.params.id;
    const { nome, cpf, cnh, validade_cnh, data_nascimento, telefone } = req.body;
    const motorista = { nome, cpf, cnh, validade_cnh, data_nascimento, telefone };
    const data = await motoristaService.updateMotorista(id, motorista);
    ok(res, data);
}

export async function setMotoristaStatusController(req, res) {
    const id = req.params.id;
    const { status } = req.body;
    const data = await motoristaService.setMotoristaStatus(id, status);
    ok(res, data);
}
