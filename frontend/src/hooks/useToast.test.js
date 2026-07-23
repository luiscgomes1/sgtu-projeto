import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useToast } from './useToast'

describe('useToast', () => {
  it('retorna undefined quando usado fora de ToastProvider', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current).toBeUndefined()
  })
})
