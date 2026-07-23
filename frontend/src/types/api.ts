export interface ApiResponse<T> {
  data?: T
  error?: string
  details?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface LoginPayload {
  email: string
  senha: string
}

export interface LoginResponse {
  user: import("./models").Usuario
  accessToken?: string
  refreshToken: string
  expiresAt: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface SignupPayload {
  nome: string
  email: string
  senha: string
  rg?: string
  cpf?: string
  telefone?: string
  data_nascimento?: string
  tipo_sanguineo?: string
  curso_id?: string
  endereco?: string
  comprovante_residencia_url?: string
  comprovante_matricula_url?: string
  foto_url?: string
}

export interface PaginatedQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
}
