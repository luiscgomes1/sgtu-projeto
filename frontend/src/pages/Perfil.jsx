import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "../hooks/useAuth"
import api from "../services/api"
import { useToast } from "../hooks/useToast"
import { UserPen, Save, Eye, EyeOff, Mail, Phone, Calendar, Fingerprint, IdCard, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { perfilSchema, senhaSchema } from "../schemas/perfil"

const fmtDate = (d) => { if (!d) return ""; try { const m = String(d).slice(0,10).split('-'); return m.length===3 ? `${m[2]}/${m[1]}/${m[0]}` : new Date(d).toLocaleDateString("pt-BR") } catch { return d } }
const fmtCPF = (v) => { if (!v) return ""; const d = v.replace(/\D/g, ""); return d.length === 11 ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}` : v }
const fmtPhone = (v) => { if (!v) return ""; const d = v.replace(/\D/g, ""); return d.length === 11 ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : v }

const REQUISITOS_SENHA = [
  { test: (s) => s.length >= 6, label: "Mínimo 6 caracteres" },
  { test: (s) => /[A-Z]/.test(s), label: "Uma letra maiúscula" },
  { test: (s) => /[0-9]/.test(s), label: "Um número" },
  { test: (s) => /[^A-Za-z0-9]/.test(s), label: "Um caractere especial" },
]

const infoFields = [
  { key: "nome", label: "Nome completo", icon: UserPen },
  { key: "email", label: "Email", icon: Mail },
  { key: "rg", label: "RG", icon: IdCard },
  { key: "cpf", label: "CPF", icon: Fingerprint, fmt: fmtCPF },
  { key: "telefone", label: "Telefone", icon: Phone, fmt: fmtPhone },
  { key: "dataNascimento", label: "Data de nascimento", icon: Calendar, fmt: fmtDate },
  { key: "tipoSanguineo", label: "Tipo sanguíneo", icon: Droplets },
]

const infoFieldsAdmin = [
  { key: "nome", label: "Nome completo", icon: UserPen },
  { key: "email", label: "Email", icon: Mail },
]

const editFieldsAluno = [
  { key: "nome", label: "Nome completo" },
  { key: "rg", label: "RG" },
  { key: "cpf", label: "CPF" },
  { key: "telefone", label: "Telefone" },
  { key: "dataNascimento", label: "Data de nascimento", type: "date" },
  { key: "tipoSanguineo", label: "Tipo sanguíneo" },
]

const editFieldsAdmin = [
  { key: "nome", label: "Nome completo" },
]

export default function Perfil() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [perfil, setPerfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState("dados")
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [senhaValida, setSenhaValida] = useState(null)
  const [validandoSenha, setValidandoSenha] = useState(false)

  const perfilForm = useForm({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nome: "", email: "", rg: "", cpf: "", telefone: "", dataNascimento: "", tipoSanguineo: "" },
  })

  const senhaForm = useForm({
    resolver: zodResolver(senhaSchema),
    defaultValues: { senhaAtual: "", novaSenha: "", confirmarSenha: "" },
  })

  const isAluno = user?.tipo === "aluno"
  const fields = isAluno ? infoFields : infoFieldsAdmin
  const editFields = isAluno ? editFieldsAluno : editFieldsAdmin

  const senhaAtualValue = senhaForm.watch("senhaAtual")
  const novaSenhaValue = senhaForm.watch("novaSenha")

  useEffect(() => {
    if (!senhaAtualValue) { setSenhaValida(null); setValidandoSenha(false); return }
    setValidandoSenha(true)
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.post("/usuario/me/validar-senha", { senha: senhaAtualValue })
        setSenhaValida(data?.valida ?? null)
      } catch { setSenhaValida(false) }
      setValidandoSenha(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [senhaAtualValue])

  function forcaSenha(senha) {
    if (!senha) return { nivel: 0, cor: "bg-muted", texto: "" }
    const cumpridos = REQUISITOS_SENHA.filter((r) => r.test(senha)).length
    const map = { 0: { cor: "bg-red-500", texto: "Muito fraca" }, 1: { cor: "bg-orange-500", texto: "Fraca" }, 2: { cor: "bg-yellow-500", texto: "Média" }, 3: { cor: "bg-lime-500", texto: "Boa" }, 4: { cor: "bg-green-500", texto: "Forte" } }
    return { nivel: cumpridos, ...map[cumpridos] }
  }

  const senhaInfo = forcaSenha(novaSenhaValue)

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const endpoint = isAluno ? "/alunos/me" : "/usuario/me"
        const { data } = await api.get(endpoint)
        setPerfil(data)
      } catch {
        showToast("error", "Erro ao carregar perfil.")
      } finally {
        setLoading(false)
      }
    }
    fetchPerfil()
  }, [isAluno, showToast])

  async function handleSalvar(data) {
    try {
      setSalvando(true)
      const endpoint = isAluno ? "/alunos/me" : "/usuario/me"
      await api.put(endpoint, data)
      setPerfil((prev) => ({ ...prev, ...data }))
      showToast("success", "Perfil atualizado com sucesso!")
      setEditando(false)
    } catch {
      showToast("error", "Erro ao atualizar perfil.")
    } finally {
      setSalvando(false)
    }
  }

  async function handleAlterarSenha(data) {
    try {
      setSalvandoSenha(true)
      await api.put("/usuario/me/senha", { senhaAtual: data.senhaAtual, novaSenha: data.novaSenha })
      showToast("success", "Senha alterada com sucesso!")
      senhaForm.reset()
    } catch {
      showToast("error", "Erro ao alterar senha.")
    } finally {
      setSalvandoSenha(false)
    }
  }

  const handleCancel = () => {
    setEditando(false);
    perfilForm.reset();
  };

  const handleEdit = () => {
    setEditando(true)
    perfilForm.reset({
      nome: perfil.nome || "",
      email: user?.email || perfil.email || "",
      rg: perfil.rg || "",
      cpf: perfil.cpf || "",
      telefone: perfil.telefone || "",
      dataNascimento: perfil.dataNascimento || "",
      tipoSanguineo: perfil.tipoSanguineo || "",
    })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!perfil) return <p className="text-center text-muted-foreground py-12">Perfil não encontrado.</p>

  const nomeIniciais = (perfil.nome || user?.nome || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="text-lg font-semibold">{nomeIniciais}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">{isAluno ? "Aluno" : "Usuário"} • {perfil.email || user?.email}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b">
        <button onClick={() => setAbaAtiva("dados")} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${abaAtiva === "dados" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          Dados Pessoais
        </button>
        <button onClick={() => setAbaAtiva("senha")} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${abaAtiva === "senha" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          Alterar Senha
        </button>
      </div>

      {abaAtiva === "dados" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Informações Pessoais</CardTitle>
            {!editando ? (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <UserPen size={14} className="mr-1" /> Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>Cancelar</Button>
                <Button size="sm" onClick={perfilForm.handleSubmit(handleSalvar)} disabled={salvando}>
                  <Save size={14} className="mr-1" /> {salvando ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!editando ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(({ key, label, icon, fmt }) => {
                  const Icon = icon
                  return (
                  <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Icon size={16} className="text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium">{label}</p>
                      <p className="text-sm text-foreground font-medium truncate">{fmt ? fmt(perfil[key]) : perfil[key] || "—"}</p>
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <Form {...perfilForm}>
                <div className="space-y-4">
                  {editFields.map(({ key, label, type }) => (
                    <FormField key={key} control={perfilForm.control} name={key} render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input {...field} type={type || "text"} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                  <FormField control={perfilForm.control} name="email" render={({ field }) => (
                    <input type="hidden" {...field} />
                  )} />
                </div>
              </Form>
            )}
          </CardContent>
        </Card>
      )}

      {abaAtiva === "senha" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alterar Senha</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...senhaForm}>
              <form onSubmit={senhaForm.handleSubmit(handleAlterarSenha)} className="space-y-5">
                <FormField control={senhaForm.control} name="senhaAtual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha atual</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input {...field} type={mostrarSenha ? "text" : "password"} placeholder="••••••••" className="pr-16" />
                      </FormControl>
                      <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {senhaAtualValue && (
                        <span className="absolute right-10 top-1/2 -translate-y-1/2 text-sm">
                          {validandoSenha ? <span className="text-muted-foreground">⋯</span> : senhaValida ? <span className="text-green-600">✓</span> : <span className="text-red-500">✗</span>}
                        </span>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <hr className="border-border" />

                <FormField control={senhaForm.control} name="novaSenha" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input {...field} type={mostrarSenha ? "text" : "password"} placeholder="Mínimo 6 caracteres" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {novaSenhaValue && (
                  <div className="mt-2 space-y-2">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${senhaInfo.cor}`} style={{ width: `${(senhaInfo.nivel / 4) * 100}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">Força: {senhaInfo.texto}</p>
                    <ul className="space-y-0.5">
                      {REQUISITOS_SENHA.map((r) => {
                        const ok = r.test(novaSenhaValue)
                        return (
                          <li key={r.label} className={`text-xs flex items-center gap-1.5 ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                            <span>{ok ? "✓" : "○"}</span> {r.label}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                <FormField control={senhaForm.control} name="confirmarSenha" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <Input {...field} type={mostrarSenha ? "text" : "password"} placeholder="Repita a nova senha" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full" disabled={salvandoSenha}>
                  <Save size={14} className="mr-1" /> {salvandoSenha ? "Salvando..." : "Atualizar Senha"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
