import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  it('lança erro quando usado fora de AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    )
  })
})
