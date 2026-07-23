import { Outlet } from "react-router-dom"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthLayout() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 gap-2"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        <span className="text-xs">{isDark ? "Claro" : "Escuro"}</span>
      </Button>

      <div className="w-full max-w-sm bg-card text-card-foreground rounded-xl shadow-xl p-8 border">
        <Outlet />
      </div>
    </div>
  )
}
