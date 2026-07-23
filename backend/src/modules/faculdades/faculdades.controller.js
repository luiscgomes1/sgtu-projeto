import * as FaculdadesService from './faculdades.service.js';
import { ok, created, notFound } from '../../utils/response.js';

export async function createFaculdadeController(req, res, next) {
    const payload = req.body;

    const faculdade = await FaculdadesService.createFaculdade(payload);
    return created(res, faculdade);
}

export async function listFaculdadesController(req, res, next) {
    const { incluirInativas, naoVinculadas } = req.query;
    const faculdades = await FaculdadesService.listFaculdades({ incluirInativas: incluirInativas === 'true', naoVinculadas: naoVinculadas === 'true' });
    return ok(res, faculdades);
}

export async function listFaculdadesPaginatedController(req, res, next) {
    const result = await FaculdadesService.listFaculdadesPaginated(req.query);
    return ok(res, result);
}

export async function getFaculdadeByIdController(req, res, next) {
    const { id } = req.params;

    const faculdade = await FaculdadesService.getFaculdadeById(id);
    if (!faculdade) return notFound(res, 'Faculdade');
    return ok(res, faculdade);
}

export async function updateFaculdadeController(req, res, next) {
    const { id } = req.params;
    const payload = req.body;

    const updatedFaculdade = await FaculdadesService.updateFaculdade(id, payload);
    if (!updatedFaculdade) return notFound(res, 'Faculdade');
    return ok(res, updatedFaculdade);
}

export async function setFaculdadeStatusController(req, res, next) {
    const { status } = req.body;
    const { id } = req.params;

    const result = await FaculdadesService.setFaculdadeStatus(id, status);
    if (!result) return notFound(res, 'Faculdade');
    return ok(res, result);
}

export async function getFaculdadeByNameController(req, res, next) {
    const { nome } = req.params;

    const faculdade = await FaculdadesService.getFaculdadeByName(nome);
    if (!faculdade) return notFound(res, 'Faculdade');
    return ok(res, faculdade);
}
