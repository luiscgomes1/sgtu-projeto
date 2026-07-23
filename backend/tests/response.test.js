import { describe, it, expect, vi } from 'vitest';
import { ok, created, notFound, fail } from '../src/utils/response.js';

function mockRes() {
  let statusCode;
  let body;
  return {
    status: vi.fn((code) => { statusCode = code; return { json: vi.fn((b) => { body = b; }) }; }),
    _getStatus: () => statusCode,
    _getBody: () => body,
  };
}

describe('response helpers', () => {
  it('ok retorna 200 com dados', () => {
    const res = mockRes();
    ok(res, { id: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('created retorna 201 com dados', () => {
    const res = mockRes();
    created(res, { id: 1 });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('notFound retorna 404 com mensagem padrao', () => {
    const res = mockRes();
    notFound(res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('notFound retorna 404 com entidade personalizada', () => {
    const res = mockRes();
    notFound(res, 'Aluno');
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('fail retorna 400 com mensagem', () => {
    const res = mockRes();
    fail(res, 400, 'Erro de validacao');
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('fail retorna 403 com mensagem', () => {
    const res = mockRes();
    fail(res, 403, 'Acesso negado');
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
