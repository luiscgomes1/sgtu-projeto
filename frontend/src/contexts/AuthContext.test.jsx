import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AuthProvider, AuthContext } from './AuthContext'
import { useContext } from 'react'

const mockCookies = vi.hoisted(() => ({ set: vi.fn(), get: vi.fn(), remove: vi.fn() }))
const mockRefresh = vi.hoisted(() => vi.fn())
const mockSetTokens = vi.hoisted(() => vi.fn())
const mockClearTokens = vi.hoisted(() => vi.fn())
const mockSetOnLogout = vi.hoisted(() => vi.fn())

vi.mock('js-cookie', () => ({ default: mockCookies }))

vi.mock('../services/api', () => ({
  apiService: { refresh: mockRefresh, logout: () => Promise.resolve(), getMe: vi.fn() },
  setTokens: (...args) => mockSetTokens(...args),
  clearTokens: (...args) => mockClearTokens(...args),
  setOnLogout: (...args) => mockSetOnLogout(...args),
}))

function TestComponent() {
  const ctx = useContext(AuthContext)
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="user">{ctx.user ? ctx.user.nome : 'null'}</span>
      <button data-testid="login" onClick={() => ctx.login({ nome: 'Admin', tipo: 'admin' }, 'at')}>
        login
      </button>
      <button data-testid="logout" onClick={ctx.logout}>
        logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookies.get.mockReturnValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('inicia com loading false após init e user null', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('loading').textContent).toBe('false')
    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('inicializa user a partir de cookie salvo', async () => {
    mockRefresh.mockResolvedValue({ accessToken: 'at' })
    mockCookies.get.mockReturnValue(JSON.stringify({ nome: 'Salvo', tipo: 'aluno' }))
    render(<AuthProvider><TestComponent /></AuthProvider>)
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Salvo')
    })
    expect(mockRefresh).toHaveBeenCalled()
    expect(mockSetTokens).toHaveBeenCalledWith('at')
  })

  it('remove cookie inválido', () => {
    mockCookies.get.mockReturnValue('invalid-json')
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(mockCookies.remove).toHaveBeenCalledWith('user')
    expect(screen.getByTestId('user').textContent).toBe('null')
  })

  it('login salva cookie, tokens e user', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    fireEvent.click(screen.getByTestId('login'))
    expect(mockCookies.set).toHaveBeenCalledWith('user', JSON.stringify({ nome: 'Admin', tipo: 'admin' }), { expires: 1 })
    expect(mockSetTokens).toHaveBeenCalledWith('at')
    expect(screen.getByTestId('user').textContent).toBe('Admin')
  })

  it('logout limpa tudo', () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    fireEvent.click(screen.getByTestId('login'))
    expect(screen.getByTestId('user').textContent).toBe('Admin')
    fireEvent.click(screen.getByTestId('logout'))
    expect(mockCookies.remove).toHaveBeenCalledWith('user')
    expect(mockClearTokens).toHaveBeenCalled()
    expect(screen.getByTestId('user').textContent).toBe('null')
  })
})
