import { ok } from '../../utils/response.js';
import * as UsuarioService from './usuario.service.js';

export async function getMeController(req, res, next) {
    const userId = req.user.id;
    const adminProfile = await UsuarioService.getUsuarioById(userId);

    if (adminProfile.tipo === 'admin') {
        return ok(res, adminProfile);
    } else {
        const profile = await UsuarioService.getAlunoProfile(userId);
        return ok(res, profile);
    }
}

export async function atualizarPerfilController(req, res, next) {
    const userId = req.user.id;
    const updatedData = req.body;

    const updatedProfile = await UsuarioService.atualizarPerfil(userId, updatedData);
    ok(res, updatedProfile);
}

export async function validarSenhaController(req, res, next) {
    const userId = req.user.id;
    const { senha } = req.body;
    const valida = await UsuarioService.validarSenha(userId, senha);
    ok(res, { valida });
}

export async function alterarSenhaController(req, res, next) {
    const userId = req.user.id;
    const { senhaAtual, novaSenha } = req.body;

    const updatedUser = await UsuarioService.alterarSenha(userId, senhaAtual, novaSenha);
    ok(res, updatedUser);
}

export async function gerarTokenTelegramController(req, res, next) {
    const userId = req.user.id;
    const result = await UsuarioService.gerarTokenTelegram(userId);
    ok(res, result);
}

export async function statusTelegramController(req, res, next) {
    const userId = req.user.id;
    const result = await UsuarioService.statusTelegram(userId);
    ok(res, result);
}

export async function desconectarTelegramController(req, res, next) {
    const userId = req.user.id;
    const result = await UsuarioService.desconectarTelegram(userId);
    ok(res, result);
}
