export interface AuthUser {
  id: string
  nome: string
  email: string
  tipo: "admin" | "aluno" | "motorista"
  status_cadastro?: string | null
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (userData: AuthUser, accessToken: string, refreshToken: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}
