import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import TelegramCard from "../../../components/TelegramCard"
import { useToast } from "../../../hooks/useToast"
import api, { apiService } from "../../../services/api"
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts"
import {
  Clock, CheckCircle2, XCircle, Eye, RotateCcw,
  ChevronLeft, ChevronRight, LayoutDashboard,
  Users, Bus, UserPlus, TrendingUp, Activity,
} from "lucide-react"

const ITEMS_PER_PAGE = 5

const statusCards = [
  { key: "pendentes", label: "Pendentes", icon: Clock, bg: "bg-amber-500", getCount: (c) => c.pendentes },
  { key: "ativos", label: "Ativos", icon: CheckCircle2, bg: "bg-emerald-600", getCount: (c) => c.ativos },
  { key: "rejeitados", label: "Rejeitados", icon: XCircle, bg: "bg-red-600", getCount: (c) => c.reprovados },
]

const PIE_COLORS = ["#f59e0b", "#10b981", "#ef4444"]
const TAB_OPTIONS = [
  { key: "pendente", label: "Pendentes", icon: Clock },
  { key: "ativo", label: "Ativos", icon: CheckCircle2 },
  { key: "reprovado", label: "Rejeitados", icon: XCircle },
]

const quickActions = [
  { label: "Nova Rota", icon: Bus, path: "/admin/rotas", desc: "Cadastrar nova rota de transporte" },
  { label: "Novo Motorista", icon: UserPlus, path: "/admin/motoristas", desc: "Registrar motorista no sistema" },
  { label: "Visualizar Relatórios", icon: TrendingUp, path: "/admin/relatorios", desc: "Acompanhar métricas e relatórios" },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [requests, setRequests] = useState([])
  const [counts, setCounts] = useState(null)
  const [estatisticas, setEstatisticas] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingList, setLoadingList] = useState(true)
  const [tab, setTab] = useState("pendente")

  useEffect(() => {
    document.title = "Dashboard Admin - SGTU"
  }, [])

  useEffect(() => {
    setLoadingList(true)

    async function load() {
      try {
        const [{ data: d1 }, { data: d2 }] = await Promise.all([
          api.get("/alunos/counts"),
          api.get("/signup/paginated", {
            params: {
              status: tab,
              limit: ITEMS_PER_PAGE,
              offset: (page - 1) * ITEMS_PER_PAGE,
            },
          }),
        ])
        setCounts(d1 ?? null)
        setRequests(d2?.data ?? [])
      } catch {
        showToast("error", "Erro ao carregar dados.")
      } finally {
        setLoading(false)
        setLoadingList(false)
      }
    }

    load()
  }, [tab, page, showToast])

  useEffect(() => {
    apiService.getEstatisticas().then(setEstatisticas).catch(() => showToast("error", "Erro ao carregar estatísticas."))
  }, [showToast])

  const totalRequests = counts ? counts[tab === "pendente" ? "pendentes" : tab === "ativo" ? "ativos" : "reprovados"] ?? 0 : 0
  const totalPages = Math.ceil(totalRequests / ITEMS_PER_PAGE)

  function handleTabChange(newTab) {
    if (newTab === tab) return
    setTab(newTab)
    setPage(1)
  }

  const pieData = counts
    ? [
        { name: "Pendentes", value: counts.pendentes },
        { name: "Ativos", value: counts.ativos },
        { name: "Rejeitados", value: counts.reprovados },
      ]
    : []

  const barData = estatisticas?.porCurso
    ? estatisticas.porCurso
        .slice()
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map((c) => ({ name: c.nome, Alunos: c.total }))
    : []

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <LayoutDashboard size={24} className="text-primary" />
        Painel de Gerenciamento
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon
          const count = counts ? card.getCount(counts) : 0
          return (
            <div
              key={card.key}
              className={`${card.bg} text-white p-5 rounded-xl shadow-lg flex items-center justify-between cursor-pointer hover:brightness-110 transition`}
              onClick={() => handleTabChange(card.key === "pendentes" ? "pendente" : card.key === "ativos" ? "ativo" : "reprovado")}
            >
              <div>
                <p className="text-sm font-light uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-extrabold mt-1">{count}</p>
              </div>
              <Icon size={36} className="opacity-60" />
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="rounded-xl border bg-card shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Activity size={16} className="text-muted-foreground" />
            Distribuição de Status
          </h3>
          {pieData.some((d) => d.value > 0) ? (
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 text-sm">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-medium text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum dado disponível.</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="rounded-xl border bg-card shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-muted-foreground" />
            Alunos por Curso (Top 10)
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Alunos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum dado disponível.</p>
          )}
        </div>
      </div>

      {/* Requests Section */}
      <section className="rounded-xl border bg-card shadow-sm">
        {/* Tabs */}
        <div className="flex border-b">
          {TAB_OPTIONS.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="p-5">
          {loadingList ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              ))}
            </div>
          ) : !Array.isArray(requests) || requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
              <p>{tab === "pendente" ? "Nenhuma solicitação pendente." : tab === "ativo" ? "Nenhum aluno ativo." : "Nenhuma solicitação rejeitada."}</p>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {requests.map((req) => (
                  <li
                    key={req.usuarioId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-foreground truncate">
                        {req.usuario?.nome || req.nome}
                      </span>
                      {req.curso?.nome && (
                        <>
                          <span className="text-muted-foreground hidden sm:inline">—</span>
                          <span className="text-sm text-muted-foreground truncate">{req.curso?.nome}</span>
                        </>
                      )}
                      {req.reenvio && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold shrink-0">
                          <RotateCcw size={12} />
                          Reenvio
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {tab === "pendente" && (
                        <Button size="sm" onClick={() => navigate(`/admin/requests/${req.usuarioId}`)}>
                          <Eye size={16} />
                          <span className="hidden sm:inline">Revisar</span>
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Próxima
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="rounded-xl border bg-card shadow-sm p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users size={18} className="text-muted-foreground" />
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="rounded-xl border bg-card shadow-sm p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity size={18} className="text-muted-foreground" />
          Atividade Recente
        </h2>
        <div className="space-y-3">
          {Array.isArray(requests) && requests.length > 0 ? (
            requests.slice(0, 4).map((req, i) => (
              <div key={req.usuario_id || i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="text-muted-foreground truncate">{req.usuario?.nome || req.nome}</span>
                <span className="text-muted-foreground">—</span>
                <span className="text-foreground capitalize">{tab === "pendente" ? "nova solicitação" : `solicitação ${tab}`}</span>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">Agora</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente.</p>
          )}
        </div>
      </section>

      <section>
        <TelegramCard />
      </section>
    </div>
  )
}
