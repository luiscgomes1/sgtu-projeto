import { useCallback, useEffect, useState } from "react"
import api from "../../../services/api"
import { useToast } from "../../../hooks/useToast"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserCheck, Search, Eye, ExternalLink, Camera } from "lucide-react"

const fmtCPF = (v) => { if (!v) return null; const d = v.replace(/\D/g, ""); return d.length === 11 ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}` : v }
const fmtPhone = (v) => { if (!v) return null; const d = v.replace(/\D/g, ""); return d.length === 11 ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : v }

const STATUS_OPTIONS = [
  { key: "ativo", label: "Ativos" },
  { key: "inativo", label: "Inativos" },
  { key: "pendente", label: "Pendentes" },
  { key: "reprovado", label: "Reprovados" },
  { key: "todos", label: "Todos" },
]

const STATUS_BADGE = {
  ATIVO: { label: "Ativo", variant: "success" },
  PENDENTE: { label: "Pendente", variant: "warning" },
  REPROVADO: { label: "Reprovado", variant: "destructive" },
  INATIVO: { label: "Inativo", variant: "secondary" },
}

export default function AdminAlunos() {
  const [alunos, setAlunos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ativo")
  const [selectedAluno, setSelectedAluno] = useState(null)
  const [alunoDetail, setAlunoDetail] = useState(null)
  const [carteirinha, setCarteirinha] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [toggling, setToggling] = useState(false)

  const { showToast } = useToast()
  const offset = (page - 1) * limit

  const fetchAlunos = useCallback(async () => {
    try {
      setLoading(true)
      const params = { limit, offset }
      if (statusFilter && statusFilter !== "todos") params.status_cadastro = statusFilter
      if (debouncedSearch?.trim()) params.search = debouncedSearch.trim()

      const { data } = await api.get("/alunos/paginated", { params })
      setAlunos(data.data || [])
      setTotal(data.total || 0)
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao carregar alunos.")
    } finally {
      setLoading(false)
    }
  }, [limit, offset, statusFilter, debouncedSearch, showToast])

  useEffect(() => {
    document.title = "Admin - Alunos"
    fetchAlunos()
  }, [fetchAlunos])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [statusFilter, debouncedSearch, limit])

  

  async function openDetail(aluno) {
    setSelectedAluno(aluno)
    setAlunoDetail(null)
    setCarteirinha(null)
    try {
      const id = aluno.usuarioId
      const { data } = await api.get(`/alunos/${id}`)
      setAlunoDetail(data)
      const alunoId = data.usuarioId || data.id
      if (alunoId) {
        try {
          const { data: cr } = await api.get(`/carteirinhas/minha-carteirinha/${alunoId}`)
          setCarteirinha(cr || null)
        } catch { /* no carteirinha */ }
      }
    } catch {
      setAlunoDetail(aluno)
    }
  }

  async function handleToggleStatus() {
    if (!alunoDetail) return
    setToggling(true)
    try {
      const id = alunoDetail.usuarioId || alunoDetail.id
      const novoStatus = alunoDetail.statusCadastro === "ativo" ? "inativo" : "ativo"
      await api.patch(`/alunos/${id}`, { status_cadastro: novoStatus })
      showToast("success", `Aluno ${novoStatus === "ativo" ? "ativado" : "desativado"} com sucesso.`)
      setShowConfirmDialog(false)
      setSelectedAluno(null)
      fetchAlunos()
    } catch {
      showToast("error", "Erro ao alterar status.")
    } finally {
      setToggling(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit))

  const list = alunos

  const detail = alunoDetail || selectedAluno
  const statusRaw = String(detail?.statusCadastro || "").toUpperCase()
  const sb = STATUS_BADGE[statusRaw] || { label: statusRaw || "N/A", variant: "secondary" }

  return (
    <div className="space-y-4">
      {/* Header */}
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <UserCheck className="text-primary" />
        Gerenciar Alunos
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-56"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm"
          >
            <option value={5}>5/página</option>
            <option value={10}>10/página</option>
            <option value={25}>25/página</option>
            <option value={50}>50/página</option>
          </select>
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((t) => (
            <Button
              key={t.key}
              size="sm"
              variant={statusFilter === t.key ? "default" : "outline"}
              onClick={() => setStatusFilter(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Faculdade</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            ) : (
              list.map((a) => {
                const nome = a.usuario?.nome || "-"
                const email = a.usuario?.email || "-"
                const telefone = fmtPhone(a.telefone) || "-"
                const curso = a.curso?.nome || "-"
                const faculdade = a.curso?.faculdade?.nome || "-"
                const status = String(a.statusCadastro || "").toUpperCase()
                const badge = STATUS_BADGE[status] || { label: status || "N/A", variant: "secondary" }

                return (
                  <TableRow key={a.usuarioId}>
                    <TableCell className="font-medium">{nome}</TableCell>
                    <TableCell>{email}</TableCell>
                    <TableCell>{telefone}</TableCell>
                    <TableCell>{faculdade}</TableCell>
                    <TableCell>{curso}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openDetail(a)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {Math.min(total, offset + 1)}–{Math.min(total, offset + limit)} de {total}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <span className="px-2">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Próxima
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAluno} onOpenChange={(open) => { if (!open) setSelectedAluno(null) }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="text-primary" size={18} />
              Detalhes do Aluno
            </DialogTitle>
          </DialogHeader>

          {detail && (
            <div className="space-y-5">
              {/* Photo */}
              <div className="flex justify-center">
                {detail.fotoUrl ? (
                  <img
                    src={detail.fotoUrl}
                    alt="Foto do aluno"
                    className="w-24 h-24 rounded-full object-cover border-4 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                    <Camera size={32} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Field label="Nome" value={detail.usuario?.nome || detail.nome} />
                <Field label="Email" value={detail.usuario?.email || detail.email} />
                <Field label="Telefone" value={fmtPhone(detail.telefone) || "-"} />
                <Field label="Data Nasc." value={detail.dataNascimento ? (()=>{try{const m=String(detail.dataNascimento).slice(0,10).split('-');return m.length===3?`${m[2]}/${m[1]}/${m[0]}`:new Date(detail.dataNascimento).toLocaleDateString("pt-BR")}catch{return detail.dataNascimento}})() : "-"} />
                <Field label="CPF" value={fmtCPF(detail.cpf) || "-"} />
                <Field label="RG" value={detail.rg || "-"} />
                <Field label="Tipo Sanguíneo" value={detail.tipoSanguineo || "-"} />
                <Field label="Curso" value={detail.curso?.nome || "-"} />
                <Field label="Faculdade" value={detail.curso?.faculdade?.nome || "-"} />
                <Field label="Status">
                  <Badge variant={sb.variant}>{sb.label}</Badge>
                </Field>
              </div>

              {/* Documents */}
              {(
                detail.comprovanteResidenciaUrl ||
                detail.comprovanteMatriculaUrl ||
                detail.fotoUrl
              ) && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-foreground">Documentos</h4>
                  <div className="space-y-2">
                    {detail.comprovanteResidenciaUrl && (
                      <DocLink href={detail.comprovanteResidenciaUrl} label="Comprovante de Residência" />
                    )}
                    {detail.comprovanteMatriculaUrl && (
                      <DocLink href={detail.comprovanteMatriculaUrl} label="Comprovante de Matrícula" />
                    )}
                    {detail.fotoUrl && (
                      <DocLink href={detail.fotoUrl} label="Foto 3x4" />
                    )}
                  </div>
                </div>
              )}

              {/* Carteirinha */}
              {carteirinha?.signedUrl && (
                <a
                  href={carteirinha.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition"
                >
                  <ExternalLink size={16} />
                  Ver Carteirinha
                </a>
              )}

              {/* Actions */}
              {["ativo", "inativo"].includes(detail.statusCadastro) && (
                <Button
                  variant={detail.statusCadastro === "ativo" ? "destructive" : "default"}
                  className="w-full"
                  onClick={() => setShowConfirmDialog(true)}
                >
                  {detail.statusCadastro === "ativo" ? "Desativar Aluno" : "Ativar Aluno"}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {alunoDetail?.statusCadastro === "ativo" ? "desativar" : "ativar"} este aluno?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={toggling} onClick={handleToggleStatus}>
              {toggling ? "Salvando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Field({ label, value, children }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="text-foreground mt-0.5">{children || value || "—"}</div>
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
      <ExternalLink size={14} className="text-muted-foreground shrink-0" />
    </a>
  )
}
