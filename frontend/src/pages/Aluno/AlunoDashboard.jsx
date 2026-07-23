import { useEffect, useState, useRef, useCallback } from "react"
import api, { apiService } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import PontoSelectionModal from "../../components/PontoSelectionModal"
import TelegramCard from "../../components/TelegramCard"
import { useToast } from "../../hooks/useToast"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bus, CheckCircle2, AlertTriangle, XCircle, Mail, Fingerprint, GraduationCap, Building2, RotateCcw, Ticket, MapPin, Edit, IdCard, Phone, Calendar, Activity } from "lucide-react"

const fmtCPF = (v) => { if (!v) return null; const d = v.replace(/\D/g, ""); return d.length === 11 ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}` : v }
const fmtPhone = (v) => { if (!v) return null; const d = v.replace(/\D/g, ""); return d.length === 11 ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : v }
const fmtDate = (d) => { if (!d) return null; try { const m = d.slice(0,10).split('-'); return m.length===3 ? `${m[2]}/${m[1]}/${m[0]}` : new Date(d).toLocaleDateString("pt-BR") } catch { return d } }

const STATUS_MAP = {
  ativo: { label: "Ativo", color: "bg-blue-600", icon: CheckCircle2, textColor: "text-blue-600" },
  inativo: { label: "Inativo", color: "bg-red-600", icon: XCircle, textColor: "text-red-600" },
  pendente: { label: "Pendente", color: "bg-amber-600", icon: AlertTriangle, textColor: "text-amber-600" },
  reprovado: { label: "Reprovado", color: "bg-red-600", icon: XCircle, textColor: "text-red-600" },
  default: { label: "Desconhecido", color: "bg-muted text-muted-foreground", icon: AlertTriangle, textColor: "text-muted-foreground" },
}

const statusMessages = {
  pendente: "Seu pedido de cadastro está sendo revisado. Aguarde a aprovação.",
  aprovado: "Seu cadastro foi aprovado! A ativação final está pendente.",
  reprovado: "Seus documentos foram reprovados. Ação necessária para reenvio.",
  ativo: "Seu cadastro está ativo e validado. Boas viagens!",
}

export default function AlunoDashboard() {
  const { user } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [ponto, setPonto] = useState(null)
  const { showToast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [carteirinha, setCarteirinha] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  const statusKey = perfil?.statusCadastro || perfil?.status || "default"
  const statusInfo = STATUS_MAP[statusKey] || STATUS_MAP.default
  const StatusIcon = statusInfo.icon
  const jaEscolheu = useRef(false)

  const fetchAlunoData = useCallback(async (alunoId) => {
    if (!alunoId) return
    try {
      const perfilData = await apiService.getMe()
      setPerfil(perfilData)

      const [resPonto, resCarteirinha] = await Promise.allSettled([
        api.get(`/aluno-pontos/aluno/${alunoId}`),
        perfilData.status === "ativo"
          ? api.get(`/carteirinhas/minha-carteirinha/${alunoId}`)
          : Promise.resolve(null),
      ])

      const pontoData = resPonto.status === "fulfilled" ? resPonto.value.data ?? null : null
      setPonto(pontoData)

      if (pontoData) jaEscolheu.current = true

      if ((perfilData.statusCadastro === "ativo" || perfilData.status === "ativo") && !pontoData && !jaEscolheu.current) {
        setShowModal(true)
      }

      if (resCarteirinha.status === "fulfilled" && resCarteirinha.value) {
        setCarteirinha(resCarteirinha.value.data ?? null)
      }
    } catch {
      showToast("error", "Erro ao carregar dados do aluno.")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    document.title = "Dashboard do Aluno - SGTU"
    const alunoId = user?.id
    if (alunoId) {
      fetchAlunoData(alunoId)
    } else {
      setLoading(false)
    }
  }, [user, fetchAlunoData])

  async function handleMarcarPresenca() {
    if (!canPerformActions) return
    try {
      await api.post("/presencas/marcar-presenca")
      setMsg("Presença marcada com sucesso!")
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao marcar presença.")
      setMsg(null)
    }
  }

  function handleReenviarDocumentos() {
    window.location.href = "/aluno/reenviar-documentos"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    )
  }

  const canPerformActions = statusKey === "ativo"
  const canResubmit = statusKey === "reprovado"
  const p = perfil || {}
  const nomeCompleto = p.nome || user?.nome || "Usuário"

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Welcome */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Bus size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Olá, {nomeCompleto.split(" ")[0]}!</h1>
          <p className="text-sm text-muted-foreground">Dashboard do Aluno</p>
        </div>
      </div>

      {/* Status Card */}
      <div className={`${statusInfo.color} text-white p-5 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <StatusIcon size={24} />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide opacity-90">Status do Cadastro</p>
            <p className="text-lg font-bold">{statusInfo.label}</p>
          </div>
        </div>
        <p className="text-sm text-white/80 max-w-sm">{statusMessages[statusKey] || ""}</p>
      </div>

      {/* Success message */}
      {msg && (
        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 p-3 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 size={16} />
          {msg}
        </div>
      )}

      {/* Quick Stats */}
      {canPerformActions && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">—</p>
            <p className="text-xs text-muted-foreground mt-1">Presenças este mês</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">—</p>
            <p className="text-xs text-muted-foreground mt-1">Dias ativo</p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-2xl font-bold text-primary">{ponto?.rota?.nome || "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">Rota atual</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="rounded-xl border bg-card shadow-sm p-5">
          <h3 className="font-semibold border-b pb-2 mb-4 flex items-center gap-2 text-foreground">
            <IdCard size={16} className="text-muted-foreground" />
            Dados do Aluno
          </h3>
          <div className="space-y-3">
            <Row icon={Mail} label="Email" value={p.email || user?.email} />
            <Row icon={IdCard} label="CPF" value={fmtCPF(p.cpf)} />
            <Row icon={Phone} label="Telefone" value={fmtPhone(p.telefone)} />
            <Row icon={Calendar} label="Nascimento" value={fmtDate(p.dataNascimento)} />
            <Row icon={GraduationCap} label="Curso" value={p.cursoNome} />
            <Row icon={Building2} label="Faculdade" value={p.faculdadeNome} />
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-xl border bg-card shadow-sm p-5">
          <h3 className="font-semibold border-b pb-2 mb-4 flex items-center gap-2 text-foreground">
            <Activity size={16} className="text-muted-foreground" />
            Ações Rápidas
          </h3>
          <div className="space-y-3">
            <Button className="w-full gap-2" onClick={handleMarcarPresenca} disabled={!canPerformActions}>
              <Fingerprint size={16} />
              Marcar Presença
            </Button>

            <Button variant="secondary" className="w-full gap-2" onClick={handleReenviarDocumentos} disabled={!canResubmit}>
              <RotateCcw size={16} />
              Reenviar Documentos
            </Button>

            {carteirinha && canPerformActions && (
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href={carteirinha?.signedUrl} target="_blank" rel="noopener noreferrer">
                  <Ticket size={16} />
                  Ver Carteirinha
                </a>
              </Button>
            )}

            {ponto && (
              <div className="mt-4 p-4 rounded-lg border bg-muted/30">
                <h4 className="font-semibold flex items-center gap-2 text-sm text-foreground">
                  <MapPin size={16} className="text-primary" />
                  Ponto de Embarque
                </h4>
                <p className="mt-2 font-medium text-foreground">{ponto.nome}</p>
                <p className="text-sm text-muted-foreground">{ponto.endereco}</p>
                <p className="text-sm text-muted-foreground">
                  Rota: {ponto.rota?.nome || "Não cadastrada"}
                </p>
                <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={() => setShowModal(true)}>
                  <Edit size={14} />
                  Alterar Ponto
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {canPerformActions && <TelegramCard />}

      {showModal && (
        <PontoSelectionModal
          alunoId={user?.id}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            jaEscolheu.current = true;
            fetchAlunoData(user?.id);
          }}
        />
      )}
    </div>
  )
}

function Row({ icon, label, value }) {
  const Icon = icon
  return (
    <div className="flex items-center gap-3">
      <Icon size={15} className="text-primary shrink-0" />
      <span className="text-xs text-muted-foreground font-medium w-20 shrink-0">{label}</span>
      <span className="text-sm text-foreground truncate">{value || "—"}</span>
    </div>
  )
}


