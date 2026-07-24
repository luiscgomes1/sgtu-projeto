/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useEffect, useCallback } from "react"
import Cookies from "js-cookie"
import { apiService, setTokens, clearTokens, setOnLogout } from "../services/api"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = Cookies.get("user")
    if (!savedUser) {
      setLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const parsed = JSON.parse(savedUser)
        setUser({ id: parsed.id, tipo: parsed.tipo })
        const tokens = await apiService.refresh()
        if (!cancelled) {
          setTokens(tokens.accessToken)
          const refreshed = await apiService.getMe()
          if (!cancelled) {
            const u = {
              id: refreshed.id,
              nome: refreshed.nome,
              email: refreshed.email,
              tipo: refreshed.tipo,
              status_cadastro: refreshed.statusCadastro,
            }
            Cookies.set("user", JSON.stringify({ id: u.id, tipo: u.tipo }), { expires: 1 })
            setUser(u)
          }
        }
      } catch {
        if (!cancelled) {
          Cookies.remove("user")
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    setOnLogout(() => {
      setUser(null)
      Cookies.remove("user")
    })
  }, [])

  const login = useCallback((userData, accessToken) => {
    Cookies.set("user", JSON.stringify({ id: userData.id, tipo: userData.tipo }), { expires: 1 })
    setTokens(accessToken)
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
      Cookies.set("user", JSON.stringify({ id: u.id, tipo: u.tipo }), { expires: 1 })
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
