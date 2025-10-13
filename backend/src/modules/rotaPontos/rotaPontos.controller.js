import * as rotaPontosService from "./rotaPontos.service.js";

export async function listByRotaController(req, res, next) {
  try {
    const { rotaId } = req.params;
    const { incluirInativos } = req.query;

    const data = await rotaPontosService.listByRota(rotaId, {
      incluirInativos: incluirInativos === "true",
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderController(req, res, next) {
  try {
    const { rotaId } = req.params;
    const { ordens } = req.body;

    const data = await rotaPontosService.updateOrder(rotaId, ordens);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function setStatusController(req, res, next) {
  try {
    const { rotaId, pontoId } = req.params;
    const { status } = req.body;

    const data = await rotaPontosService.setStatus(rotaId, pontoId, status);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function isOrderedController(req, res, next) {
  try {
    const { rotaId } = req.params;
    
    const data = await rotaPontosService.isOrdered(rotaId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

