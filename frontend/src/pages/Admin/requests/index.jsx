import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IdCard, Mail, GraduationCap,
  Paperclip, Landmark, ArrowLeft, Check, Ban, RefreshCw, Phone,
  Droplets, MapPin, Ticket, User, Calendar,
} from "lucide-react";

const STATUS_INFO = {
  ativo: { label: "Ativo", variant: "success" },
  pendente: { label: "Pendente", variant: "warning" },
  reprovado: { label: "Reprovado", variant: "destructive" },
};

function fmtCPF(v) { if (!v) return null; const d = v.replace(/\D/g, ""); return d.length === 11 ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}` : v }
function fmtRG(v) { return v || null }
function fmtPhone(v) { if (!v) return null; const d = v.replace(/\D/g, ""); return d.length === 11 ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : v }
function fmtDate(d) { if (!d) return null; try { const m = d.slice(0,10).split('-'); return m.length===3 ? `${m[2]}/${m[1]}/${m[0]}` : new Date(d).toLocaleDateString("pt-BR") } catch { return d } }

export default function AdminRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [carteirinha, setCarteirinha] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const { showToast } = useToast();

  const statusKey = request?.statusCadastro || request?.status || "pendente"
  const statusInfo = STATUS_INFO[statusKey] || { label: statusKey, variant: "secondary" }
  const isAlunoFinalizado = statusKey === "ativo"

  const fetchCarteirinha = useCallback(async (alunoId) => {
    try {
      const { data } = await api.get(`/carteirinhas/minha-carteirinha/${alunoId}`)
      setCarteirinha(data || null)
    } catch { /* sem carteirinha */ }
  }, [])

  useEffect(() => {
    if (request && isAlunoFinalizado) {
      const alunoId = request.usuarioId || request.id
      fetchCarteirinha(alunoId)
    }
  }, [request, isAlunoFinalizado, fetchCarteirinha])

  useEffect(() => {
    document.title = "Detalhes da Requisição - SGTU"

    async function fetchRequest() {
      try {
        const { data } = await api.get(`/signup/${id}`)
        setRequest(data)
      } catch {
        try {
          const { data } = await api.get(`/alunos/${id}`)
          setRequest(data)
        } catch (error) {
          showToast("error", error.response?.data?.error || "Erro ao buscar detalhes da requisição.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [id, showToast])

  async function handleApprove() {
    setProcessing(true)
    try {
      const endpoint = request.reenvio ? `/signup/${id}/approve-reenvio` : `/signup/${id}/approve`
      await api.put(endpoint)
      showToast("success", "Requisição aprovada com sucesso!")
      setConfirmAction(null)
      navigate("/admin")
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao aprovar requisição.")
    } finally {
      setProcessing(false)
    }
  }

  async function handleReprove() {
    setProcessing(true)
    try {
      await api.put(`/signup/${id}/reprove`)
      showToast("success", "Requisição reprovada.")
      setConfirmAction(null)
      navigate("/admin")
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao reprovar requisição.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Requisição não encontrada.
      </div>
    )
  }

  const nome = request.usuario?.nome || request.nome || "—"
  const email = request.usuario?.email || request.email

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
          <ArrowLeft size={16} />
        </Button>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border shrink-0">
          {request.fotoUrl ? (
            <img src={request.fotoUrl} alt={nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <User size={20} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{nome}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {request.reenvio && (
              <Badge variant="secondary" className="gap-1">
                <RefreshCw size={12} />
                Reenvio
              </Badge>
            )}
          </div>
        </div>
      </div>



      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados Pessoais */}
        <div className="rounded-xl border bg-card shadow-sm p-5">
          <h3 className="font-semibold border-b pb-2 mb-4 flex items-center gap-2 text-foreground">
            <User size={16} className="text-muted-foreground" />
            Dados Pessoais
          </h3>
          <div className="space-y-3">
            <Row icon={Mail} label="Email" value={email} />
            <Row icon={IdCard} label="CPF" value={fmtCPF(request.cpf)} />
            <Row icon={IdCard} label="RG" value={fmtRG(request.rg)} />
            <Row icon={Phone} label="Telefone" value={fmtPhone(request.telefone)} />
            <Row icon={Calendar} label="Nascimento" value={fmtDate(request.dataNascimento)} />
            <Row icon={Droplets} label="Tipo Sanguíneo" value={request.tipoSanguineo} />
            <Row icon={MapPin} label="Endereço" value={request.endereco} />
          </div>

          <h3 className="font-semibold border-b pb-2 mt-6 mb-4 flex items-center gap-2 text-foreground">
            <GraduationCap size={16} className="text-muted-foreground" />
            Informações Acadêmicas
          </h3>
          <div className="space-y-3">
            <Row icon={Landmark} label="Faculdade" value={request.curso?.faculdade?.nome || request.faculdadeNome || "—"} />
            <Row icon={GraduationCap} label="Curso" value={request.curso?.nome || request.cursoNome || "—"} />
          </div>
        </div>

        {/* Documentos e Ações */}
        <div className="rounded-xl border bg-card shadow-sm p-5">
          <h3 className="font-semibold border-b pb-2 mb-4 flex items-center gap-2 text-foreground">
            <Paperclip size={16} className="text-muted-foreground" />
            Documentos
          </h3>

          <div className="space-y-2">
            {request.comprovanteResidenciaUrl && (
              <DocLink href={request.comprovanteResidenciaUrl} label="Comprovante de Residência" />
            )}
            {request.comprovanteMatriculaUrl && (
              <DocLink href={request.comprovanteMatriculaUrl} label="Comprovante de Matrícula" />
            )}
            {request.fotoUrl && (
              <DocLink href={request.fotoUrl} label="Foto 3x4" />
            )}
            {!request.comprovanteResidenciaUrl && !request.comprovanteMatriculaUrl && !request.fotoUrl && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento anexado.</p>
            )}
          </div>

          {carteirinha?.signedUrl && isAlunoFinalizado && (
            <a
              href={carteirinha.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition mt-4"
            >
              <Ticket size={16} />
              Ver Carteirinha
            </a>
          )}

          {/* Ações */}
          {statusKey === "pendente" && (
            <div className="flex flex-col gap-3 mt-6">
              <Button className="w-full gap-2" onClick={() => setConfirmAction("approve")} disabled={processing}>
                <Check size={16} />
                {processing ? "Aprovando..." : "Aprovar Requisição"}
              </Button>
              <Button variant="destructive" className="w-full gap-2" onClick={() => setConfirmAction("reprove")} disabled={processing}>
                <Ban size={16} />
                {processing ? "Reprovando..." : "Reprovar Requisição"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/admin")}>
        <ArrowLeft size={16} />
        Voltar para o Painel
      </Button>

      {/* Confirm Dialogs */}
      <AlertDialog open={confirmAction === "approve"} onOpenChange={(o) => { if (!o) setConfirmAction(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar requisição?</AlertDialogTitle>
            <AlertDialogDescription>
              O aluno será aprovado e poderá ser ativado posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={processing} onClick={handleApprove}>
              {processing ? "Aprovando..." : "Confirmar Aprovação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === "reprove"} onOpenChange={(o) => { if (!o) setConfirmAction(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprovar requisição?</AlertDialogTitle>
            <AlertDialogDescription>
              O aluno será notificado e poderá reenviar os documentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={processing} onClick={handleReprove}>
              {processing ? "Reprovando..." : "Confirmar Reprovação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Row({ icon, label, value }) {
  const Icon = icon
  return (
    <div className="flex items-center gap-3">
      <Icon size={15} className="text-primary shrink-0" />
      <span className="text-xs text-muted-foreground font-medium w-24 shrink-0">{label}</span>
      <span className="text-sm text-foreground truncate">{value || "—"}</span>
    </div>
  )
}

function DocLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition text-sm"
    >
      <span className="text-foreground">{label}</span>
      <Paperclip size={14} className="text-muted-foreground shrink-0" />
    </a>
  )
}
