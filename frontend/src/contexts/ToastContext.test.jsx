import { cleanup, render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ToastProvider, ToastContext } from './ToastContext'
import { useContext } from 'react'

function TestComponent() {
  const { showToast } = useContext(ToastContext)
  return (
    <div>
      <button data-testid="type-success" onClick={() => showToast('success', 'Sucesso!')}>success</button>
      <button data-testid="type-error" onClick={() => showToast('error', 'Erro!')}>error</button>
      <button data-testid="type-info" onClick={() => showToast('info', 'Info!')}>info</button>
      <button data-testid="type-warning" onClick={() => showToast('warning', 'Aviso!')}>warning</button>
    </div>
  )
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
  })

  it('renderiza children', () => {
    render(<ToastProvider><div data-testid="child">filho</div></ToastProvider>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('mostra toast de sucesso', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>)
    fireEvent.click(screen.getByTestId('type-success'))
    expect(screen.getByText('Sucesso!')).toBeInTheDocument()
  })

  it('mostra toast de erro', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>)
    fireEvent.click(screen.getByTestId('type-error'))
    expect(screen.getByText('Erro!')).toBeInTheDocument()
  })

  it('mostra toast de info', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>)
    fireEvent.click(screen.getByTestId('type-info'))
    expect(screen.getByText('Info!')).toBeInTheDocument()
  })

  it('mostra toast de warning', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>)
    fireEvent.click(screen.getByTestId('type-warning'))
    expect(screen.getByText('Aviso!')).toBeInTheDocument()
  })

  it('remove toast após 3 segundos', () => {
    render(<ToastProvider><TestComponent /></ToastProvider>)
    fireEvent.click(screen.getByTestId('type-success'))
    expect(screen.getByText('Sucesso!')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.queryByText('Sucesso!')).not.toBeInTheDocument()
  })
})
