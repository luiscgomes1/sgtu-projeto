import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  UserCheck,
  Route,
  Building2,
  GraduationCap,
  MapPin,
  Users,
  ClipboardList,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Alunos", to: "/admin/alunos", icon: <UserCheck size={18} /> },
  { label: "Rotas", to: "/admin/rotas", icon: <Route size={18} /> },
  { label: "Faculdades", to: "/admin/faculdades", icon: <Building2 size={18} /> },
  { label: "Cursos", to: "/admin/cursos", icon: <GraduationCap size={18} /> },
  { label: "Pontos", to: "/admin/pontos", icon: <MapPin size={18} /> },
  { label: "Motoristas", to: "/admin/motoristas", icon: <Users size={18} /> },
  { label: "Escalas", to: "/admin/escalas", icon: <ClipboardList size={18} /> },
  { label: "Relatórios", to: "/admin/relatorios", icon: <FileText size={18} /> },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Nav section */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
          Admin
        </div>

        {navItems.map((item) => {
          const active = isActive(item.to)
          return (
            <NavLink key={item.to} to={item.to} onClick={onClose}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150",
                  active
                    ? "bg-sidebar-active text-primary font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
                )}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
