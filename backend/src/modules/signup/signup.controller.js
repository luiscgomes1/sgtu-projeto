import * as signupService from './signup.service.js';
import { ok, created } from '../../utils/response.js';
import { maskAluno } from '../../utils/mask.js';

export async function createRequestController(req, res, next) {
    const payload = req.body;
    const data = await signupService.createSignupRequest(payload);
    created(res, data);
}

export async function updateRequestController(req, res, next) {
    const { id } = req.params;
    const payload = req.body;
    const data = await signupService.updateSignupRequest(id, payload);
    ok(res, data);
}

export async function listRequestsPaginatedController(req, res, next) {
    const { status, limit = 10, offset = 0 } = req.query;
    const {data, total} = await signupService.listRequestsPaginated({
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    ok(res, { data: data.map(a => maskAluno(a, req.user)), total });
}

export async function listRequestsController(req, res, next) {
    const data = await signupService.listRequests();
    ok(res, data.map(a => maskAluno(a, req.user)));
}

export async function listPendingController(req, res, next) {
    const data = await signupService.listPendingRequests();
    ok(res, data.map(a => maskAluno(a, req.user)));
}

export async function approveController(req, res, next) {
    const id = req.params.id;
    const result = await signupService.approveSignupRequest(id, req.user.id);
    ok(res, result);
}

export async function getRequestByIdController(req, res, next) {
    const { id } = req.params;
    const data = await signupService.getRequestById(id);
    ok(res, maskAluno(data, req.user));
}

export async function obterMeuPerfilController(req, res, next) {
    const alunoId = req.user.id;
    const aluno = await signupService.obterMeuPerfil(alunoId);
    ok(res, aluno);
}

export async function reproveController(req, res, next) {
    const id = req.params.id;
    const result = await signupService.reproveSignupRequest(id);
    ok(res, result);
}

export async function approveReenvioController(req, res, next) {
    const id = req.params.id;
    const result = await signupService.approveReenvioRequest(id);
    ok(res, result);
}