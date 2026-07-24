import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import ErrorBoundary from "./components/ErrorBoundary"
import PublicLayout from "./layouts/PublicLayout"
import AdminLayout from "./layouts/AdminLayout"
import AuthLayout from "./layouts/AuthLayout"
import ProtectedRoute from "./routes/ProtectedRoute"

const Login = lazy(() => import("./pages/auth/Login"))
const Cadastro = lazy(() => import("./pages/auth/Cadastro"))
const Home = lazy(() => import("./pages/Home"))
const AlunoDashboard = lazy(() => import("./pages/Aluno/AlunoDashboard"))
const ReenvioDocumentos = lazy(() => import("./pages/Aluno/ReenvioDocumentos"))
const AdminDashboard = lazy(() => import("./pages/Admin/dashboard"))
const AdminAlunos = lazy(() => import("./pages/Admin/alunos"))
const AdminRotas = lazy(() => import("./pages/Admin/rotas"))
const AdminFaculdades = lazy(() => import("./pages/Admin/faculdades"))
const AdminCursos = lazy(() => import("./pages/Admin/cursos"))
const AdminPontos = lazy(() => import("./pages/Admin/pontos"))
const AdminMotoristas = lazy(() => import("./pages/Admin/motoristas"))
const AdminEscalas = lazy(() => import("./pages/Admin/escalas"))
const AdminRelatorios = lazy(() => import("./pages/Admin/relatorios"))
const AdminConfiguracoes = lazy(() => import("./pages/Admin/configuracoes"))
const AdminRequestDetail = lazy(() => import("./pages/Admin/requests"))
const Perfil = lazy(() => import("./pages/Perfil"))
const MotoristaVolta = lazy(() => import("./pages/MotoristaVolta"))

function LazyFallback() {
  return (
    <div className="h-50vh flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Suspense fallback={<LazyFallback />}>
        <Routes>
          <Route path="/login" element={<AuthLayout />}>
            <Route index element={<Login />} />
          </Route>
          <Route path="/cadastro" element={<Cadastro />} />

          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="perfil" element={<Perfil />} />
            </Route>
            <Route element={<ProtectedRoute requiredRole="aluno" />}>
              <Route path="aluno" element={<AlunoDashboard />} />
              <Route path="aluno/reenviar-documentos" element={<ReenvioDocumentos />} />
            </Route>
            <Route path="motorista/volta" element={<MotoristaVolta />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="alunos" element={<AdminAlunos />} />
            <Route path="rotas" element={<AdminRotas />} />
            <Route path="faculdades" element={<AdminFaculdades />} />
            <Route path="cursos" element={<AdminCursos />} />
            <Route path="pontos" element={<AdminPontos />} />
            <Route path="motoristas" element={<AdminMotoristas />} />
            <Route path="escalas" element={<AdminEscalas />} />
            <Route path="relatorios" element={<AdminRelatorios />} />
            <Route path="configuracoes" element={<AdminConfiguracoes />} />
            <Route path="requests/:id" element={<AdminRequestDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
