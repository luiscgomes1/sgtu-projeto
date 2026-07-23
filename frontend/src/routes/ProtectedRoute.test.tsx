import { cleanup, render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

const mockUseAuth = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('mostra skeleton quando loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<div>conteudo</div>} />
          </Route>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(document.querySelector('.h-screen')).toBeInTheDocument()
    expect(screen.queryByText('conteudo')).not.toBeInTheDocument()
  })

  it('redireciona para /login quando não autenticado', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<div>conteudo</div>} />
          </Route>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByText('conteudo')).not.toBeInTheDocument()
  })

  it('não renderiza Outlet quando role não corresponde', () => {
    mockUseAuth.mockReturnValue({ user: { tipo: 'aluno' }, loading: false })
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route index element={<div>conteudo</div>} />
          </Route>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.queryByText('conteudo')).not.toBeInTheDocument()
    expect(document.querySelector('.h-screen')).not.toBeInTheDocument()
  })

  it('renderiza Outlet quando role corresponde', () => {
    mockUseAuth.mockReturnValue({ user: { tipo: 'admin' }, loading: false })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/dashboard" element={<div>Painel Admin</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Painel Admin')).toBeInTheDocument()
  })
})
