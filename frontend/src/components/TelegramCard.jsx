import { useEffect, useState, useRef, useCallback } from "react"
import api from "../services/api"
import { useToast } from "../hooks/useToast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Send, Loader2, Unlink, CheckCircle2 } from "lucide-react"

export default function TelegramCard() {
  const { showToast } = useToast()
  const [conectado, setConectado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState(null)
  const [polling, setPolling] = useState(false)
  const [tokenCopiado, setTokenCopiado] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    api.get("/usuario/me/telegram/status").then(({ data }) => setConectado(data.conectado)).catch(() => setConectado(false))
  }, [])

  useEffect(() => {
    if (!polling || !link) return
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get("/usuario/me/telegram/status")
        if (data.conectado) {
          setConectado(true)
          setPolling(false)
          setLink(null)
          setTokenCopiado(false)
          showToast("success", "Telegram conectado com sucesso!")
        }
      } catch { /* polling */ }
    }, 3000)
    return () => clearInterval(pollRef.current)
  }, [polling, link, showToast])

  const handleGerar = useCallback(async () => {
    setLoading(true)
    setTokenCopiado(false)
    try {
      const { data } = await api.post("/usuario/me/telegram/token")
      setLink(data.link)
      setPolling(true)
    } catch { showToast("error", "Erro ao gerar link.") }
    finally { setLoading(false) }
  }, [showToast])

  const handleCopiarVincular = useCallback(async () => {
    const token = link.split("?start=")[1]
    await navigator.clipboard.writeText(`/vincular ${token}`)
    showToast("success", "Comando copiado! Cole no Telegram.")
    setPolling(false)
    setTokenCopiado(true)
  }, [link, showToast])

  const handleVerificarConexao = useCallback(async () => {
    try {
      const { data } = await api.get("/usuario/me/telegram/status")
      if (data.conectado) {
        setConectado(true)
        setLink(null)
        setPolling(false)
        setTokenCopiado(false)
        showToast("success", "Telegram conectado com sucesso!")
      } else {
        showToast("info", "Ainda não detectamos a conexão. Envie o comando no Telegram e tente novamente.")
      }
    } catch { showToast("error", "Erro ao verificar status.") }
  }, [showToast])

  const handleDesconectar = async () => {
    try {
      await api.post("/usuario/me/telegram/desconectar")
      setConectado(false)
      setLink(null)
      setPolling(false)
      setTokenCopiado(false)
      showToast("success", "Telegram desconectado.")
    } catch { showToast("error", "Erro ao desconectar.") }
  }

  if (conectado === null) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-primary" />
          Telegram
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conectado ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">Conectado</Badge>
              <span className="text-sm text-muted-foreground">Receba notificações no Telegram</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDesconectar}>
              <Unlink className="mr-1 h-4 w-4" /> Desconectar
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Conecte sua conta ao Telegram para receber notificações.
            </p>
            {link ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link)}`}
                  alt="QR Code Telegram"
                  className="rounded-lg border"
                />
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Escaneie com seu celular ou{" "}
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    clique aqui
                  </a>{" "}
                  para abrir no Telegram.
                </p>
                <div className="rounded-md border bg-muted/50 p-3 w-full">
                  <p className="text-xs font-medium mb-1 text-muted-foreground">Já iniciou o bot? Envie no Telegram:</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-mono h-auto py-1.5"
                    onClick={handleCopiarVincular}
                  >
                    Copiar /vincular {link.split("?start=")[1].slice(0, 8)}... e colar no Telegram
                  </Button>
                </div>
                {tokenCopiado && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Comando copiado! Envie no Telegram e clique em "Verificar Conexão".
                  </div>
                )}
                {polling && !tokenCopiado && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Aguardando conexão...
                  </div>
                )}
                {tokenCopiado && (
                  <Button variant="secondary" size="sm" onClick={handleVerificarConexao}>
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Verificar Conexão
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => { setLink(null); setPolling(false); setTokenCopiado(false) }}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button onClick={handleGerar} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Conectar Telegram
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
