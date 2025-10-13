import * as CursoService from './cursos.service.js';

export async function createCursoController(req, res, next) {
    try {
        const payload = req.body;

        const curso = await CursoService.createCurso(payload);
        return res.status(201).json(curso);
    } catch (error) {
        next(error);
    }
}

export async function listCursosController(req, res, next) {
    try {
        const { incluirInativos } = req.query;
        const cursos = await CursoService.listCursos({ incluirInativos });
        return res.json(cursos);
    } catch (error) {
        next(error);
    }
}

export async function getCursoByIdController(req, res, next) {
    try {
        const { id } = req.params;        

        const curso = await CursoService.getCursoById(id);
        if (!curso) return res.status(404).json({ error: "Curso não encontrado" });
        return res.json(curso);
    } catch (error) {
        next(error);
    }
}

export async function updateCursoController(req, res, next) {
    try {
        const { id } = req.params;
        const payload = req.body;
        
        const curso = await CursoService.updateCurso(id, payload);
        return res.json(curso);
    } catch (error) {
        next(error);
    }
}

export async function setCursoStatusController(req, res, next) {
    try {
        const { status } = req.body;
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "ID do Curso é obrigatório" });
        const result = await CursoService.setCursoStatus(id, status);
        if (!result) return res.status(404).json({ error: "Curso não encontrado" });
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function listCursosByFaculdadeController(req, res, next) {
    try {
        const { faculdadeId } = req.params;
        const { incluirInativos } = req.query;
        if (!faculdadeId) return res.status(400).json({ error: "ID da Faculdade é obrigatório" });
        const cursos = await CursoService.listCursosByFaculdade(faculdadeId, { incluirInativos });
        return res.json(cursos);
    } catch (error) {
        next(error);
    }
}
