import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTheme } from "next-themes"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "../../hooks/useToast"
import api from "../../services/api"
import { cadastroSchema } from "../../schemas/auth"
import { ArrowLeft, Sun, Moon } from "lucide-react"

import CadastroDadosPessoais from "./CadastroDadosPessoais.jsx"
import CadastroDadosAcademicos from "./CadastroDadosAcademicos.jsx"
import CadastroDocumentos from "./CadastroDocumentos.jsx"

export default function Cadastro() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  const [files, setFiles] = useState({
    comprovante_matricula_url: null,
    comprovante_residencia_url: null,
    foto_url: null,
  })
  const [loading, setLoading] = useState(false)
  const [faculdades, setFaculdades] = useState([])
  const [cursos, setCursos] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const form = useForm({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "", email: "", senha: "", rg: "", cpf: "", telefone: "",
      data_nascimento: "", tipo_sanguineo: "", faculdade_id: "", curso_id: "",
      logradouro: "", numero: "", bairro: "", cidade: "", estado: "",
    },
  })

  useEffect(() => { document.title = "Cadastro de Aluno - SGTU" }, [])

  useEffect(() => {
    async function fetchFaculdades() {
      try {
        const { data: res } = await api.get("/faculdades")
        setFaculdades(Array.isArray(res) ? res : [])
      } catch (error) {
        showToast("error", "Erro ao carregar faculdades.")
      }
    }
    fetchFaculdades()
  }, [showToast])

  async function handleFaculdadeChange(faculdadeId) {
    form.setValue("curso_id", "")
    if (!faculdadeId) { setCursos([]); return }
    try {
      const { data: resCursos } = await api.get(`/cursos/${faculdadeId}`)
      setCursos(Array.isArray(resCursos) ? resCursos : [])
    } catch (error) {
      showToast("error", "Erro ao carregar cursos.")
    }
  }

  function handleFileChange(e) {
    const { name, files: selected } = e.target
    if (selected?.[0]) {
      setFiles((prev) => ({ ...prev, [name]: selected[0] }))
    }
  }

  async function handleCadastro(data) {
    setLoading(true)

    const enderecoCompleto = [
      data.logradouro, data.numero, data.bairro, data.cidade, data.estado,
    ].filter(Boolean).join(", ")

    const payload = { ...data, endereco: enderecoCompleto }
    delete payload.logradouro
    delete payload.numero
    delete payload.bairro
    delete payload.cidade
    delete payload.estado

    try {
      const { data: requestRes } = await api.post("/signup/request", payload)
      const request = requestRes

      const formData = new FormData()
      formData.append("files", files.comprovante_matricula_url)
      formData.append("files", files.comprovante_residencia_url)
      formData.append("files", files.foto_url)

      const uploadRes = await api.post(`/upload/${request.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const [matricula, residencia, foto] = (uploadRes.data?.files ?? []).map((f) => f.path)

      await api.patch(`/signup/${request.id}`, {
        comprovante_matricula_url: matricula,
        comprovante_residencia_url: residencia,
        foto_url: foto,
      })

      showToast("success", "Cadastro com sucesso! Aguarde aprovação do administrador.")
      setTimeout(() => navigate("/"), 3000)
    } catch (error) {
      showToast("error", "Erro ao enviar cadastro. Verifique os dados.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 gap-2"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        <span className="text-xs">{isDark ? "Claro" : "Escuro"}</span>
      </Button>

      <Card className="w-full max-w-3xl">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute left-4 top-4 gap-1" asChild>
            <Link to="/">
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </Button>
          <CardTitle className="text-center text-primary pt-6">Formulário de Cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCadastro)} className="space-y-8">
              <CadastroDadosPessoais control={form.control} showPassword={showPassword} setShowPassword={setShowPassword} />
              <CadastroDadosAcademicos control={form.control} faculdades={faculdades} cursos={cursos} form={form} handleFaculdadeChange={handleFaculdadeChange} />
              <CadastroDocumentos files={files} handleFileChange={handleFileChange} />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Cadastro"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
