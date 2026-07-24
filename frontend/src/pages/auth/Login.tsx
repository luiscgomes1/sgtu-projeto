import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { useToast } from "../../hooks/useToast"
import { apiService } from "../../services/api"
import { loginSchema } from "../../schemas/auth"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  })

  useEffect(() => {
    document.title = "Login - SGTU"
  }, [])

  const handleLogin = async (data: { email: string; senha: string }) => {
    setLoading(true)
    try {
      const result = await apiService.login(data)
      login(result.user, result.accessToken!)

      if (result.user.tipo === "admin") {
        navigate("/admin")
      } else {
        navigate("/aluno")
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "Falha no login. Verifique suas credenciais."
      showToast("error", msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
        <div className="relative">
          <Button variant="ghost" size="sm" className="absolute -top-2 -left-2 gap-1" asChild>
            <Link to="/">
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="text-center space-y-2">
          <div className="w-20 h-12 mx-auto rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
            SGTU
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Acesse sua conta SGTU
          </h1>
        </div>

        <div className="space-y-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <FormControl>
                  <Input {...field} type="email" placeholder="Email" className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="senha" render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <FormControl>
                  <Input {...field} type={showPassword ? "text" : "password"} placeholder="Senha" className="pl-10 pr-10" />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          <LogIn size={18} />
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="text-primary font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </Form>
  )
}
