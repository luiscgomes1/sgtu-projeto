import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Cadastro from './Cadastro'

const mockNavigate = vi.fn()
const mockShowToast = vi.fn()
const mockApi = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

vi.mock('../../services/api', () => ({ default: mockApi }))

describe('Cadastro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.get.mockResolvedValue({ data: [] })
  })

  afterEach(() => {
    cleanup()
  })

  it('renderiza formulário com seções', async () => {
    render(<MemoryRouter><Cadastro /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Formulário de Cadastro')).toBeInTheDocument()
    })
    expect(screen.getByText('Dados Pessoais')).toBeInTheDocument()
    expect(screen.getByText('Dados Acadêmicos')).toBeInTheDocument()
    expect(screen.getByText('Documentos Obrigatórios')).toBeInTheDocument()
  })

  it('renderiza campos do formulário', async () => {
    render(<MemoryRouter><Cadastro /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Nome Completo:')).toBeInTheDocument()
    })
    expect(screen.getByText('Email:')).toBeInTheDocument()
    expect(screen.getByText('Senha:')).toBeInTheDocument()
    expect(screen.getByText('RG:')).toBeInTheDocument()
    expect(screen.getByText('Telefone:')).toBeInTheDocument()
    expect(screen.getByText('Data de Nascimento:')).toBeInTheDocument()
    expect(screen.getByText('Tipo Sanguíneo:')).toBeInTheDocument()
    expect(screen.getByText('Logradouro:')).toBeInTheDocument()
  })

  it('botão de voltar existe', async () => {
    render(<MemoryRouter><Cadastro /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Voltar')).toBeInTheDocument()
    })
  })

  it('botão de submit existe', async () => {
    render(<MemoryRouter><Cadastro /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Enviar Cadastro')).toBeInTheDocument()
    })
  })

  it('carrega faculdades ao montar', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: '1', nome: 'Faculdade Teste' }] })
    render(<MemoryRouter><Cadastro /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByText('Faculdade Teste')).toBeInTheDocument()
    })
  })

  it('mostra toast de erro se faculdades falharem', async () => {
    mockApi.get.mockRejectedValue({ response: { data: { error: 'Erro ao carregar' } } })
    render(<MemoryRouter><Cadastro /></MemoryRouter>)
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('error', 'Erro ao carregar')
    })
  })
})
