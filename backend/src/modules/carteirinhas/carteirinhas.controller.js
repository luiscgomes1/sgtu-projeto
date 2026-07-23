import { gerarCarteirinha, listarCarteirinhas, validarQRCode, obterCarteirinhaAtiva, gerarPreviewBuffer, gerarPreviewMock } from './carteirinhas.service.js';
import { ok, created } from '../../utils/response.js';

export async function gerarCarteirinhaController(req, res, next) {
    const { alunoId } = req.params;
    const criadoPor = req.user.id;
    const result = await gerarCarteirinha(alunoId, criadoPor);
    created(res, result);
}

export async function obterCarteirinhaAtivaController(req, res, next) {
    const { alunoId } = req.params;
    const requester = req.user;
    const data = await obterCarteirinhaAtiva(alunoId, requester);
    ok(res, data);
}

export async function listarCarteirinhasController(req, res, next) {
    const { alunoId } = req.params;
    const requester = req.user;
    const data = await listarCarteirinhas(alunoId, requester);
    ok(res, data);
}

export async function validarQRCodeController(req, res, next) {
    const { token } = req.body;
    const result = await validarQRCode(token);
    ok(res, result);
}

export async function previewMockController(req, res, next) {
    const buffer = await gerarPreviewMock();
    res.set('Content-Type', 'application/pdf');
    res.send(buffer);
}