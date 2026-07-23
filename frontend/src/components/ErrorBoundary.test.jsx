import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

afterEach(() => {
  document.body.innerHTML = ''
})

function GoodChild() {
  return <div>Componente funcionando</div>
}

function BadChild() {
  throw new Error('Erro simulado')
}

describe('ErrorBoundary', () => {
  it('renderiza children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Componente funcionando')).toBeInTheDocument()
  })

  it('renderiza fallback quando filho lança erro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <BadChild />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
    expect(screen.getByText('Ir para o início')).toBeInTheDocument()
  })

  it('botão "Tentar novamente" re-renderiza children', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { rerender } = render(
      <ErrorBoundary>
        <BadChild />
      </ErrorBoundary>,
    )

    rerender(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    )

    fireEvent.click(screen.getByText('Tentar novamente'))

    expect(screen.getByText('Componente funcionando')).toBeInTheDocument()
  })
})
