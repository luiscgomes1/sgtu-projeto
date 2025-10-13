import { normalizarUsuario } from '../../utils/functions.js';
import * as AlunoService from '../alunos/alunos.service.js';

export async function listarAlunosController(req, res, next) {
    try {
        const alunos = await AlunoService.listarAlunos();
        if(!alunos) return res.status(404).json({ error: "Nenhum aluno cadastrado." });

        res.json(alunos);
    } catch (error) {
        next(error);
    }
}

export async function listAlunosPaginatedController(req, res, next) {
    try {
        const { status_cadastro, limit = 10, offset = 0 } = req.query;
        const {data, total} = await AlunoService.listAlunosPaginated({
          status_cadastro,
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        res.json({ data, total });
    } catch (error) {
        next(error);
    }
}

export async function obterMeuPerfilController(req, res, next) {
    try {
        const alunoId = req.user.id;

        const aluno = await AlunoService.obterMeuPerfil(alunoId);
        res.status(200).json(normalizarUsuario(aluno));
    } catch (error) {
        next(error);
    }
}

export async function obterAlunoController(req, res, next) {
    try {
        const { id } = req.params;

        const aluno = await AlunoService.obterAluno(id);
        res.json(aluno);
    } catch (error) {
        next(error);
    }
}

export async function atualizarAlunoController(req, res, next) {
    try {
        const id = req.params.id || req.user?.id;
        const dados = req.body;

        const aluno = await AlunoService.atualizarAluno(id, dados);
        res.json(aluno);
    } catch (error) {
        next(error);
    }
}

export async function inativarAlunoController(req, res, next) {
    try {
        const { id } = req.params;
        const aluno = await AlunoService.inativarAluno(id);
        res.json(aluno);
    } catch (error) {
        next(error);
    }
}

export async function renviarDocumentosController(req, res, next) {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    if (id !== usuarioId) {
      return res.status(403).json({ error: "Você só pode reenviar seus próprios documentos." });
    }

    const payload = req.body;

    const result = await AlunoService.reenviarDocumentos(usuarioId, payload);
    res.status(201).json(normalizarUsuario(result));
  } catch (error) {
    next(error);
  }
}