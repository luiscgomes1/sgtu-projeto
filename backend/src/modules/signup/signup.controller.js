import * as signupService from './signup.service.js';

export async function createRequestController(req, res, next) {
  try {
    const payload = req.body;

    const data = await signupService.createSignupRequest(payload);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function updateRequestController(req, res, next) {
  try {
    const { requestId } = req.params;
    const payload = req.body;

    const data = await signupService.updateSignupRequest(requestId, payload);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function listRequestsPaginatedController(req, res, next) {
  try {
    const { status, limit = 10, offset = 0 } = req.query;
    const {data, total} = await signupService.listRequestsPaginated({
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json({ data, total });
  } catch (error) {
    next(error);
  }
}

export async function listRequestsController(req, res, next) {
  try {
    const data = await signupService.listRequests(req.user);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function listPendingController(req, res, next) {
  try {
    const data = await signupService.listPendingRequests();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function approveController(req, res, next) {
  try {
    const id = req.params.id;

    const result = await signupService.approveSignupRequest(id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getRequestByIdController(req, res, next) {
  try {
    const { id } = req.params;
    
    const data = await signupService.getRequestById(id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function obterMeuPerfilController(req, res, next) {
    try {
        const alunoId = req.user.id;

        const aluno = await signupService.obterMeuPerfil(alunoId);
        res.json(aluno);
    } catch (error) {
        next(error);
    }
}

export async function reproveController(req, res, next) {
  try {
    const id = req.params.id;

    const result = await signupService.reproveSignupRequest(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function approveReenvioController(req, res, next) {
  try {
    const id = req.params.id;

    const result = await signupService.approveReenvioRequest(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}