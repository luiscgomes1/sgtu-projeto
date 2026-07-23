export type UserRole = "admin" | "aluno" | "motorista"
export type Status = "ativo" | "inativo"
export type StatusCadastro = "pendente" | "aprovado" | "reprovado"

export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: UserRole
  status: Status
  createdAt?: string
}

export interface Aluno {
  usuarioId: string
  statusCadastro: StatusCadastro
  rg: string | null
  cpf: string | null
  telefone: string | null
  dataNascimento: string | null
  tipoSanguineo: string | null
  cursoId: string | null
  fotoUrl: string | null
  comprovanteResidenciaUrl: string | null
  comprovanteMatriculaUrl: string | null
  endereco: string | null
  telegramId: string | null
  usuario?: Usuario
  curso?: Curso
  carteirinha_url?: string | null
}

export interface AlunoPerfil {
  id: string
  usuarioId: string
  nome: string
  email: string
  tipo: UserRole
  status: Status
  rg: string | null
  telefone: string | null
  dataNascimento: string | null
  tipoSanguineo: string | null
  cursoId: string | null
  cursoNome: string | null
  faculdadeId: string | null
  faculdadeNome: string | null
  statusCadastro: StatusCadastro
}

export interface Motorista {
  id: string
  nome: string
  cpf: string | null
  cnh: string | null
  validadeCnh: string | null
  dataNascimento: string | null
  telefone: string | null
  status: Status
  createdAt?: string
}

export interface Faculdade {
  id: string
  nome: string
  status: Status
  createdAt?: string
}

export interface Curso {
  id: string
  nome: string
  faculdadeId: string
  faculdade?: Faculdade
  status: Status
  createdAt?: string
}

export interface Rota {
  id: string
  nome: string
  status: Status
  createdAt?: string
}

export interface Ponto {
  id: string
  nome: string
  endereco: string | null
  status: Status
  createdAt?: string
}

export interface RotaPonto {
  id: string
  rotaId: string
  pontoId: string
  ordem: number
  status: Status
  ponto?: Ponto
}

export interface Viagem {
  id: string
  rotaId: string
  data: string
  rota?: Rota
}

export interface Presenca {
  id: string
  alunoId: string
  viagemId: string
  rotaId: string
  data: string
  status: Status
  aluno?: Aluno
  viagem?: Viagem
}

export interface EscalaAtribuicao {
  id: string
  rotaId: string
  ano: number
  mes: number
  posicao: number
  motoristaId: string
  status: Status
  motorista?: Motorista
}

export interface Carteirinha {
  id: string
  alunoId: string
  dataValidade: string
  qrcodeToken: string
  arquivoUrl: string | null
  criadoPorId: string
  signedUrl?: string
}

export interface Configuracao {
  id: number
  logoUrl: string | null
  nomeOrganizacao: string | null
  horaLimitePresenca?: string
}

export interface RefreshToken {
  id: string
  usuarioId: string
  expiresAt: string
  revokedAt: string | null
}
