import * as FaculdadesService from './faculdades.service.js';

export async function createFaculdadeController(req, res, next) {
    try {
        const payload = req.body;

        const faculdade = await FaculdadesService.createFaculdade(payload);
        return res.status(201).json(faculdade);
    } catch (error) {
        next(error);
    }
}

export async function listFaculdadesController(req, res, next) {
    try {
        const faculdades = await FaculdadesService.listFaculdades();
        return res.json(faculdades);
    } catch (error) {
        next(error);
    }
}

export async function getFaculdadeByIdController(req, res, next) {
    try {
        const { id } = req.params;
        
        const faculdade = await FaculdadesService.getFaculdadeById(id);
        if (!faculdade) return res.status(404).json({ error: "Faculdade não encontrada" });
        return res.json(faculdade);
    } catch (error) {
        next(error);
    }
}

export async function updateFaculdadeController(req, res, next) {
    try {
        const { id } = req.params;
        const payload = req.body;
        
        const updatedFaculdade = await FaculdadesService.updateFaculdade(id, payload);
        if (!updatedFaculdade) return res.status(404).json({ error: "Faculdade não encontrada" });
        return res.json(updatedFaculdade);
    } catch (error) {
        next(error);
    }
}

export async function setFaculdadeStatusController(req, res, next) {
    try {
        const { status } = req.body;
        const { id } = req.params;
        
        const result = await FaculdadesService.setFaculdadeStatus(id, status);
        if (!result) return res.status(404).json({ error: "Faculdade não encontrada" });
        return res.json(result);
    } catch (error) {
        next(error);
    }
}

export async function getFaculdadeByNameController(req, res, next) {
    try {
        const { nome } = req.params;
       
        const faculdade = await FaculdadesService.getFaculdadeByName(nome);
        if (!faculdade) return res.status(404).json({ error: "Faculdade não encontrada" });
        return res.json(faculdade);
    } catch (error) {
        next(error);
    }
}
