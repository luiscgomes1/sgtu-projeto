import { gerarCarteirinha, listarCarteirinhas, validarQRCode, obterCarteirinhaAtiva } from './carteirinhas.service.js';

export async function gerarCarteirinhaController(req, res, next) {
  try {
    const { alunoId } = req.params;
    const criadoPor = req.user.id;

    const result = await gerarCarteirinha(alunoId, criadoPor);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function obterCarteirinhaAtivaController(req, res, next) {
  try {
    const { alunoId } = req.params;
    const requester = req.user;

    const data = await obterCarteirinhaAtiva(alunoId, requester);
    return res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function listarCarteirinhasController(req, res, next) {
  try {
    const { alunoId } = req.params;
    const requester = req.user;

    const data = await listarCarteirinhas(alunoId, requester);
    return res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function validarQRCodeController(req, res, next) {
  try {
    const { token } = req.body;

    const result = await validarQRCode(token);
    return res.json(result);
  } catch (error) {
    next(error);
  }
}