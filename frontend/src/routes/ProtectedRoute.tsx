import { Navigate, Outlet } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "../hooks/useAuth"

interface ProtectedRouteProps {
  requiredRole?: "admin" | "aluno"
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

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

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && user.tipo !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
