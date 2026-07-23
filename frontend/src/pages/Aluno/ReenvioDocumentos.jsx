import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import api from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import { useToast } from "../../hooks/useToast"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { reenvioDocumentosSchema } from "../../schemas/aluno"
import { Upload, Save, ArrowLeft, FileText, User, CheckCircle2, AlertTriangle } from "lucide-react"

const DOC_FIELDS = [
  { name: "comprovante_matricula", label: "Comprovante de Matrícula", accept: "image/*,application/pdf" },
  { name: "comprovante_residencia", label: "Comprovante de Residência", accept: "image/*,application/pdf" },
  { name: "foto", label: "Foto 3x4", accept: "image/*" },
]

const FIELD_ICONS = { comprovante_matricula: FileText, comprovante_residencia: FileText, foto: User }

export default function ReenvioDocumentos() {
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [aluno, setAluno] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  const form = useForm({
    resolver: zodResolver(reenvioDocumentosSchema),
    defaultValues: {
      comprovante_matricula: undefined,
      comprovante_residencia: undefined,
      foto: undefined,
    },
  })

  useEffect(() => {
    document.title = "Reenvio de Documentos - SGTU"
    if (user) {
      setAluno(user)
      setLoading(false)
    }
  }, [user])

  async function onSubmit(values) {
    const allSelected = DOC_FIELDS.every((f) => values[f.name] instanceof File)
    if (!allSelected) {
      showToast("error", "Selecione todos os três documentos antes de enviar.")
      return
    }

    setSubmitting(true)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("files", values.comprovante_matricula)
      formData.append("files", values.comprovante_residencia)
      formData.append("files", values.foto)

      const isApproved = !!aluno?.usuario_id
      let entityId = aluno.id

      if (isApproved) {
        const { data: reenvio } = await api.post(`/alunos/${aluno.usuario_id}/reenviar-documentos`, {
          usuario_id: aluno.usuario_id,
          nome: aluno.nome,
          email: aluno.email,
          cpf: aluno.cpf,
          rg: aluno.rg,
          telefone: aluno.telefone,
          data_nascimento: aluno.data_nascimento,
          endereco: aluno.endereco,
          tipo_sanguineo: aluno.tipo_sanguineo,
          curso_id: aluno.curso_id,
        })
        entityId = reenvio.id
      }

      const uploadRes = await api.post(`/upload/${entityId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const [matricula, residencia, foto] = uploadRes.data.files.map((f) => f.path)

      await api.patch(`/signup/${entityId}`, {
        comprovante_matricula_url: matricula,
        comprovante_residencia_url: residencia,
        foto_url: foto,
      })

      await refreshUser()
      setSuccess("Documentos reenviados! Aguarde a análise do administrador.")
      showToast("success", "Documentos enviados com sucesso!")
      setTimeout(() => navigate("/aluno"), 2000)
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao reenviar documentos.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!aluno) return null

  const isApproved = !!aluno?.usuario_id

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Reenvio de Documentos</h1>
          <p className="text-sm text-muted-foreground">Atualize seus documentos para análise</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 p-4 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle size={16} className={isApproved ? "text-blue-500" : "text-amber-500"} />
            {isApproved ? "Dados do aluno ativo" : "Dados do último pedido"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow label="Nome" value={aluno.nome} />
            <InfoRow label="Email" value={aluno.email} />
            <InfoRow label="CPF" value={aluno.cpf} />
            <InfoRow label="Telefone" value={aluno.telefone} />
            <InfoRow label="Nascimento" value={aluno.data_nascimento} />
            <InfoRow label="Tipo Sanguíneo" value={aluno.tipo_sanguineo} />
          </div>
          <InfoRow label="Endereço" value={aluno.endereco} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
            <InfoRow label="Faculdade" value={aluno.faculdade_nome} />
            <InfoRow label="Curso" value={aluno.curso_nome} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload size={16} className="text-primary" />
            Envio de Novos Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {DOC_FIELDS.map((field) => {
                  const Icon = FIELD_ICONS[field.name]
                  return (
                    <FormField
                      key={field.name}
                      name={field.name}
                      control={form.control}
                      render={({ field: { value, onChange, ...fieldProps } }) => {
                        const file = value
                        return (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground mb-1.5 block">{field.label}</FormLabel>
                            <FormControl>
                              <input
                                type="file"
                                id={field.name}
                                accept={field.accept}
                                className="hidden"
                                onChange={(e) => onChange(e.target.files[0])}
                                {...fieldProps}
                              />
                            </FormControl>
                            <label
                              htmlFor={field.name}
                              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition ${
                                file
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                  : "border-border hover:border-primary hover:bg-muted/50"
                              }`}
                            >
                              <Icon size={24} className={file ? "text-emerald-600" : "text-muted-foreground"} />
                              <span className="text-xs text-center text-muted-foreground break-all">
                                {file?.name || "Clique para selecionar"}
                              </span>
                              {file && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                            </label>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  )
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Save size={16} className="animate-spin mr-1" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-1" />
                      Reenviar Documentos
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/aluno")}>
                  <ArrowLeft size={16} className="mr-1" />
                  Voltar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <p className="text-sm text-foreground">{value || "—"}</p>
    </div>
  )
}
