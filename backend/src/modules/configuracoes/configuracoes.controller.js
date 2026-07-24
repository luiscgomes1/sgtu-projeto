import { ok } from '../../utils/response.js';
import * as ConfiguracoesService from '../configuracoes/configuracoes.service.js';

export async function getConfiguracoesController(req, res, next) {
    const configuracao = await ConfiguracoesService.getConfiguracao();
    ok(res, configuracao);
}

export async function updateHoraLimiteController(req, res, next) {
    const { horaLimite } = req.body;

    const updated = await ConfiguracoesService.updateHoraLimite(horaLimite);
    ok(res, updated);
}

export async function getHoraLimitePresencaController(req, res, next) {
    const horaLimite = await ConfiguracoesService.gethoraLimitePresenca();
    ok(res, { hora_limite_presenca: horaLimite });
}

export async function updateLogoController(req, res, next) {
    const { logoUrl } = req.body;
    const updated = await ConfiguracoesService.updateLogoUrl(logoUrl || null);
    ok(res, updated);
}

export async function updateNomeOrganizacaoController(req, res, next) {
    const { nomeOrganizacao } = req.body;
    const updated = await ConfiguracoesService.updateNomeOrganizacao(nomeOrganizacao);
    ok(res, updated);
}

export async function getHorariosViagemController(req, res, next) {
    const horarios = await ConfiguracoesService.getHorariosViagem();
    ok(res, horarios);
}

export async function updateHorariosViagemController(req, res, next) {
    const updated = await ConfiguracoesService.updateHorariosViagem(req.body);
    ok(res, updated);
}

export async function uploadLogoController(req, res, next) {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    const updated = await ConfiguracoesService.uploadLogo(req.file);
    ok(res, updated);
}