import { describe, it, expect } from 'vitest';
import { paginate, paginatedResponse } from '../src/utils/pagination.js';

describe('paginate', () => {
  it('deve retornar skip=0 e take=20 para página 1 default', () => {
    const result = paginate({});
    expect(result).toMatchObject({ skip: 0, take: 20, page: 1, limit: 20 });
  });

  it('deve calcular skip corretamente para página 3', () => {
    const result = paginate({ page: 3, limit: 10 });
    expect(result).toMatchObject({ skip: 20, take: 10, page: 3, limit: 10 });
  });

  it('deve limitar take a 100 mesmo se enviar valor maior', () => {
    const result = paginate({ limit: 999 });
    expect(result.take).toBe(100);
  });

  it('deve forçar página mínima 1', () => {
    const result = paginate({ page: 0, limit: 20 });
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });
});

describe('paginatedResponse', () => {
  const data = [{ id: 1 }, { id: 2 }];

  it('deve montar estrutura com pagination', () => {
    const result = paginatedResponse(data, 10, { page: 1, limit: 5 });
    expect(result).toEqual({
      data,
      pagination: {
        page: 1,
        limit: 5,
        total: 10,
        totalPages: 2,
      },
    });
  });

  it('deve retornar totalPages = 1 quando total <= limit', () => {
    const result = paginatedResponse(data, 2, { page: 1, limit: 20 });
    expect(result.pagination.totalPages).toBe(1);
  });

  it('deve retornar totalPages = 0 quando total = 0', () => {
    const result = paginatedResponse([], 0, { page: 1, limit: 20 });
    expect(result.pagination.totalPages).toBe(0);
  });
});
