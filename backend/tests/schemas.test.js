import { describe, it, expect } from 'vitest';
import { uuidParam, nomeField, emailField, cpfField, senhaField, statusField } from '../src/shared/schemas.js';

describe('shared schemas', () => {
  it('uuidParam aceita UUID v4 válido', () => {
    const result = uuidParam.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('uuidParam rejeita string não-UUID', () => {
    const result = uuidParam.safeParse('invalido');
    expect(result.success).toBe(false);
  });

  it('nomeField aceita nome válido', () => {
    const result = nomeField.safeParse('João Silva');
    expect(result.success).toBe(true);
  });

  it('nomeField rejeita nome muito curto', () => {
    const result = nomeField.safeParse('AB');
    expect(result.success).toBe(false);
  });

  it('emailField aceita email válido', () => {
    const result = emailField.safeParse('teste@exemplo.com');
    expect(result.success).toBe(true);
  });

  it('emailField rejeita email inválido', () => {
    const result = emailField.safeParse('invalido');
    expect(result.success).toBe(false);
  });

  it('cpfField aceita 11 dígitos', () => {
    const result = cpfField.safeParse('12345678901');
    expect(result.success).toBe(true);
  });

  it('cpfField rejeita string curta', () => {
    const result = cpfField.safeParse('123');
    expect(result.success).toBe(false);
  });

  it('senhaField aceita senha forte', () => {
    const result = senhaField.safeParse('Senha@123');
    expect(result.success).toBe(true);
  });

  it('senhaField rejeita senha sem maiúscula', () => {
    const result = senhaField.safeParse('senha@123');
    expect(result.success).toBe(false);
  });

  it('senhaField rejeita senha sem especial', () => {
    const result = senhaField.safeParse('Senha123');
    expect(result.success).toBe(false);
  });

  it('senhaField rejeita senha curta', () => {
    const result = senhaField.safeParse('Ab@1');
    expect(result.success).toBe(false);
  });

  it('statusField aceita valores válidos', () => {
    expect(statusField.safeParse('ativo').success).toBe(true);
    expect(statusField.safeParse('inativo').success).toBe(true);
  });

  it('statusField rejeita valor inválido', () => {
    const result = statusField.safeParse('pendente');
    expect(result.success).toBe(false);
  });
});
