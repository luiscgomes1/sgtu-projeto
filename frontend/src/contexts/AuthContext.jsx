import { createContext, useState, useEffect, useCallback } from "react"
import Cookies from "js-cookie"
import { apiService, setTokens, clearTokens, setOnLogout } from "../services/api"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = Cookies.get("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        Cookies.remove("user")
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    setOnLogout(() => {
      setUser(null)
      Cookies.remove("user")
    })
  }, [])

  const login = useCallback((userData, accessToken, refreshToken) => {
    Cookies.set("user", JSON.stringify(userData), { expires: 1 })
    setTokens(accessToken, refreshToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    apiService.logout().catch(() => {})
    clearTokens()
    Cookies.remove("user")
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!user) return
    try {
      const refreshed = await apiService.getMe()
      const u = {
        id: refreshed.id,
        nome: refreshed.nome,
        email: refreshed.email,
        tipo: refreshed.tipo,
        status_cadastro: refreshed.statusCadastro,
      }
      Cookies.set("user", JSON.stringify(u), { expires: 1 })
      setUser(u)
    } catch {
      logout()
    }
  }, [user, logout])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
