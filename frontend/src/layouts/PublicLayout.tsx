import { Outlet } from "react-router-dom"
import Header from "../components/layout/Header"

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-6 px-4 md:px-6">
        <Outlet />
      </main>
      <footer className="py-6 text-center border-t text-muted-foreground text-sm">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} SGTU. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
