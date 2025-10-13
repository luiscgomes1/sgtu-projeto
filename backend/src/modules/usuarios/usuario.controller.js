import * as UsuarioService from './usuario.service.js';

export async function getMeController(req, res, next) {
    try {
        const userId = req.user.id;
        const adminProfile = await UsuarioService.getUsuarioById(userId);
        
        if (adminProfile.tipo === 'admin') {
            return res.json(adminProfile);
        } else {
            const profile = await UsuarioService.getAlunoProfile(userId);
            return res.json(profile);
        }
    } catch (error) {
        next(error);
    }
}

export async function atualizarPerfilController(req, res, next) {
    try {
        const userId = req.user.id;
        const updatedData = req.body;
        
        const updatedProfile = await UsuarioService.atualizarPerfil(userId, updatedData);
        res.json(updatedProfile);
    } catch (error) {
        next(error);
    }
}

export async function alterarSenhaController(req, res, next) {
    try {
        const userId = req.user.id;
        const { senhaAtual, novaSenha } = req.body;

        const updatedUser = await UsuarioService.alterarSenha(userId, senhaAtual, novaSenha);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
}
