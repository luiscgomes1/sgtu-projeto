import { ok, created, notFound, fail } from '../../utils/response.js';
import * as AlunoService from '../alunos/alunos.service.js';
import { maskAluno } from '../../utils/mask.js';

function formatarPerfilAluno(aluno) {
  if (!aluno) return null;
  return {
    id: aluno.usuarioId,
    usuarioId: aluno.usuarioId,
    nome: aluno.usuario?.nome,
    email: aluno.usuario?.email,
    tipo: aluno.usuario?.tipo,
    status: aluno.usuario?.status,
    rg: aluno.rg,
    cpf: aluno.cpf,
    telefone: aluno.telefone,
    dataNascimento: aluno.dataNascimento,
    tipoSanguineo: aluno.tipoSanguineo,
    cursoId: aluno.cursoId,
    cursoNome: aluno.curso?.nome,
    faculdadeId: aluno.curso?.faculdadeId,
    faculdadeNome: aluno.curso?.faculdade?.nome,
    statusCadastro: aluno.statusCadastro,
  };
}

export async function listarAlunosController(req, res) {
    const alunos = await AlunoService.listarAlunos();
    if (!alunos) return notFound(res, 'Aluno');

    ok(res, alunos.map(a => maskAluno(a, req.user)));
}

export async function listAlunosPaginatedController(req, res) {
    const { status_cadastro, limit = 10, offset = 0, faculdade_id, curso_id, search } = req.query;
    const { data, total } = await AlunoService.listAlunosPaginated({
        status_cadastro,
        limit: parseInt(limit),
        offset: parseInt(offset),
        faculdade_id: faculdade_id || null,
        curso_id: curso_id || null,
        search: search || null,
    });
    ok(res, { data: data.map(a => maskAluno(a, req.user)), total });
}

export async function obterEstatisticasController(req, res) {
    const { status_cadastro } = req.query;
    const stats = await AlunoService.obterEstatisticas({ status_cadastro });
    ok(res, stats);
}

export async function obterMeuPerfilController(req, res) {
    const alunoId = req.user.id;
    const aluno = await AlunoService.obterMeuPerfil(alunoId);
    ok(res, maskAluno(formatarPerfilAluno(aluno), req.user));
}

export async function obterAlunoController(req, res) {
    const { id } = req.params;
    const aluno = await AlunoService.obterAluno(id);
    if (!aluno) return notFound(res, 'Aluno');
    ok(res, maskAluno(aluno, req.user));
}

export async function atualizarAlunoController(req, res) {
    const id = req.params.id || req.user?.id;
    const dados = req.body;
    const aluno = await AlunoService.atualizarAluno(id, dados);
    ok(res, aluno);
}

export async function inativarAlunoController(req, res) {
    const { id } = req.params;
    const { status_cadastro } = req.body;
    if (status_cadastro) {
        const aluno = await AlunoService.inativarAluno(id, status_cadastro);
        ok(res, aluno);
    } else {
        const aluno = await AlunoService.inativarAluno(id);
        ok(res, aluno);
    }
}

export async function renviarDocumentosController(req, res) {
    const { id } = req.params;
    const usuarioId = req.user.id;

    if (id !== usuarioId) {
        return fail(res, 403, 'Você só pode reenviar seus próprios documentos.');
    }

    const payload = req.body;
    const result = await AlunoService.reenviarDocumentos(usuarioId, payload);
    created(res, formatarPerfilAluno(result));
}

export async function obterContagensController(req, res) {
    const counts = await AlunoService.obterContagens();
    ok(res, counts);
}
