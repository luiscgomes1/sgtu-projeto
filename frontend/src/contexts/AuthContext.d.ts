import type { AuthUser } from "../types/auth"

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (userData: AuthUser, accessToken: string, refreshToken: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

export const AuthContext: React.Context<AuthContextValue>

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactNode
