import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()
const mockShowToast = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('../../services/api', () => ({
  apiService: {
    login: vi.fn(),
  },
}))

function qs(sel) {
  return document.querySelector(sel)
}

function getEmailInput() {
  return qs('input[name="email"]')
}

function getSenhaInput() {
  return qs('input[name="senha"]')
}

function getSubmitButton() {
  return qs('button[type="submit"]')
}

function renderLogin() {
  return render(<MemoryRouter><Login /></MemoryRouter>)
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renderiza formulário de login', () => {
    renderLogin()
    expect(getEmailInput()).toBeInTheDocument()
    expect(getSenhaInput()).toBeInTheDocument()
    expect(getSubmitButton()).toBeInTheDocument()
  })

  it('mostra erro de validação para email inválido', async () => {
    renderLogin()
    fireEvent.change(getEmailInput(), { target: { value: 'invalido' } })
    fireEvent.change(getSenhaInput(), { target: { value: '123' } })
    fireEvent.submit(getEmailInput().closest('form'))

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
    })
  })

  it('navega para /admin após login admin', async () => {
    const { apiService } = await import('../../services/api')
    apiService.login.mockResolvedValue({
      user: { tipo: 'admin', email: 'admin@teste.com' },
      accessToken: 'token',
      refreshToken: 'refresh',
    })

    renderLogin()
    fireEvent.change(getEmailInput(), { target: { value: 'admin@teste.com' } })
    fireEvent.change(getSenhaInput(), { target: { value: 'Senha@123' } })
    await act(async () => { fireEvent.submit(getEmailInput().closest('form')) })

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { tipo: 'admin', email: 'admin@teste.com' },
        'token',
      )
    })
    expect(mockNavigate).toHaveBeenCalledWith('/admin')
  })

  it('navega para /aluno após login aluno', async () => {
    const { apiService } = await import('../../services/api')
    apiService.login.mockResolvedValue({
      user: { tipo: 'aluno', email: 'aluno@teste.com' },
      accessToken: 'token',
      refreshToken: 'refresh',
    })

    renderLogin()
    fireEvent.change(getEmailInput(), { target: { value: 'aluno@teste.com' } })
    fireEvent.change(getSenhaInput(), { target: { value: 'Senha@123' } })
    await act(async () => { fireEvent.submit(getEmailInput().closest('form')) })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/aluno')
    })
  })

  it('mostra toast de erro quando login falha', async () => {
    const { apiService } = await import('../../services/api')
    apiService.login.mockRejectedValue(new Error('Credenciais inválidas'))

    renderLogin()
    fireEvent.change(getEmailInput(), { target: { value: 'aluno@teste.com' } })
    fireEvent.change(getSenhaInput(), { target: { value: 'Senha@123' } })
    await act(async () => { fireEvent.submit(getEmailInput().closest('form')) })

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('error', 'Credenciais inválidas')
    })
  })

  it('alterna visibilidade da senha', async () => {
    renderLogin()
    expect(getSenhaInput()).toHaveAttribute('type', 'password')

    fireEvent.click(qs('button[type="button"]'))
    expect(getSenhaInput()).toHaveAttribute('type', 'text')
  })

  it('tem link para cadastro', () => {
    renderLogin()
    const links = screen.getAllByRole('link')
    const cadastro = links.find((l) => l.textContent === 'Cadastre-se')
    expect(cadastro).toHaveAttribute('href', '/cadastro')
  })
})
