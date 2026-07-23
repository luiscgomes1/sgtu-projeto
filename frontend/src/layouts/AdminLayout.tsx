import { useState, useEffect } from "react"
import { Outlet, useNavigate, Navigate } from "react-router-dom"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import Header from "../components/layout/Header"
import Sidebar from "../components/layout/Sidebar"
import { useAuth } from "../hooks/useAuth"
import { setOnLogout } from "../services/api"

export default function AdminLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setOnLogout(() => {
      navigate("/login")
    })
  }, [navigate])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-80">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (!user || user.tipo !== "admin") {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onSidebarOpen={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        <div className="md:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="max-w-7xl mx-auto py-6 px-4 md:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
