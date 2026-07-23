import * as CursoService from './cursos.service.js';
import { ok, created, notFound, fail } from '../../utils/response.js';

export async function createCursoController(req, res, next) {
    const payload = req.body;

    const curso = await CursoService.createCurso(payload);
    return created(res, curso);
}

export async function listCursosController(req, res, next) {
    const { incluirInativos } = req.query;
    const cursos = await CursoService.listCursos({ incluirInativos });
    return ok(res, cursos);
}

export async function listCursosPaginatedController(req, res, next) {
    const result = await CursoService.listCursosPaginated(req.query);
    return ok(res, result);
}

export async function getCursoByIdController(req, res, next) {
    const { id } = req.params;

    const curso = await CursoService.getCursoById(id);
    if (!curso) return fail(res, 404, 'Curso não encontrado');
    return ok(res, curso);
}

export async function updateCursoController(req, res, next) {
    const { id } = req.params;
    const payload = req.body;

    const curso = await CursoService.updateCurso(id, payload);
    return ok(res, curso);
}

export async function setCursoStatusController(req, res, next) {
    const { status } = req.body;
    const { id } = req.params;
    if (!id) return fail(res, 400, 'ID do Curso é obrigatório');
    const result = await CursoService.setCursoStatus(id, status);
    if (!result) return fail(res, 404, 'Curso não encontrado');
    return ok(res, result);
}

export async function listCursosByFaculdadeController(req, res, next) {
    const { faculdadeId } = req.params;
    const { incluirInativos } = req.query;
    if (!faculdadeId) return fail(res, 400, 'ID da Faculdade é obrigatório');
    const cursos = await CursoService.listCursosByFaculdade(faculdadeId, { incluirInativos });
    return ok(res, cursos);
}
