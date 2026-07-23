import { useEffect } from "react"
import { Link, Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "../hooks/useAuth"
import { ArrowRight, Bus, QrCode, Users, ClipboardCheck, MapPin, Shield, ChevronRight } from "lucide-react"

const features = [
  {
    icon: Bus,
    title: "Presenças Online",
    desc: "Marque presença pelo site ou Telegram. Adeus planilhas e papelada.",
  },
  {
    icon: QrCode,
    title: "Carteirinhas Digitais",
    desc: "Geração automática com QR Code único para validação de embarque.",
  },
  {
    icon: Users,
    title: "Gestão de Motoristas",
    desc: "Lista de embarques pronta e notificações automáticas em tempo real.",
  },
  {
    icon: ClipboardCheck,
    title: "Controle Administrativo",
    desc: "Aprovação de cadastros, relatórios e escalas em um só lugar.",
  },
  {
    icon: MapPin,
    title: "Pontos de Embarque",
    desc: "Rotas e pontos personalizados por faculdade.",
  },
  {
    icon: Shield,
    title: "Segurança e Conformidade",
    desc: "Dados protegidos e processos auditáveis para sua instituição.",
  },
]

const stats = [
  { value: "500+", label: "Alunos" },
  { value: "15+", label: "Faculdades" },
  { value: "98%", label: "Satisfação" },
]

export default function Home() {
  const { user } = useAuth()

  useEffect(() => {
    document.title = "SGTU - Sistema de Gestão de Transporte Universitário"
  }, [])

  if (user) {
    const destino = user.tipo === "admin" ? "/admin" : user.tipo === "aluno" ? "/aluno" : "/perfil"
    return <Navigate to={destino} replace />
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/3 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Sistema em funcionamento
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
              Transporte Universitário{" "}
              <span className="text-primary">simplificado</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              O SGTU unifica presença, carteirinhas digitais e gestão de frota
              em uma plataforma moderna. Menos burocracia, mais eficiência.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2 text-base shadow-lg shadow-primary/20" asChild>
                <Link to="/cadastro">
                  Comece Agora <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-2 text-base" asChild>
                <Link to="/login">
                  Fazer Login <ChevronRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-3xl font-extrabold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Tudo que você precisa
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Do cadastro ao embarque, o SGTU automatiza cada etapa do transporte universitário.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group bg-card text-card-foreground rounded-xl border p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Pronto para modernizar sua gestão?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Cadastre sua faculdade e comece a usar o SGTU hoje mesmo.
          </p>
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
            <Link to="/cadastro">
              Solicitar Acesso <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
