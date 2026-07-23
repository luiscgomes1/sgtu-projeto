import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "next-themes"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Menu, LogOut, User, X } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import logo from "../../assets/cone-minimalista-de-nibus-dentro-de-um-c-rculo-azu.png"

interface HeaderProps {
  onSidebarOpen?: () => void
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDark = theme === "dark"

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-40 w-full h-16 px-4 md:px-6 flex items-center justify-between bg-card border-b shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {onSidebarOpen && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onSidebarOpen}>
            <Menu size={20} />
          </Button>
        )}

        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="SGTU"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-extrabold text-lg tracking-wide text-foreground hidden sm:inline">
            SGTU
          </span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setTheme(isDark ? "light" : "dark")} title={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {isDark ? "Claro" : "Escuro"}
          </span>
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 px-2">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs">{user.nome.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline max-w-[120px] truncate">{user.nome}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/perfil")}>
                <User size={16} />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut size={16} />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/cadastro">Cadastre-se</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

// Mobile menu button (used outside this component via onSidebarOpen)
