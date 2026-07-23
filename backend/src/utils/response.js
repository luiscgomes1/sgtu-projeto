export function ok(res, data, status = 200) {
  return res.status(status).json(data);
}

export function created(res, data) {
  return res.status(201).json(data);
}

export function notFound(res, entity = 'Registro') {
  return res.status(404).json({ error: `${entity} não encontrado.` });
}

export function fail(res, status = 400, message = 'Requisição inválida') {
  return res.status(status).json({ error: message });
}
