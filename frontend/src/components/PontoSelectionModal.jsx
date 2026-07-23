import { useEffect, useState, useCallback } from "react"
import api from "../services/api"
import { useToast } from "../hooks/useToast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Check, Save } from "lucide-react"

export default function PontoSelectionModal({ alunoId, onClose, onSaved }) {
  const [pontos, setPontos] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  const fetchPontos = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/pontos?status=ativo")
      setPontos(data || [])
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao buscar pontos disponíveis.")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchPontos()
  }, [fetchPontos])

  async function handleSave() {
    if (!selected) return
    try {
      setSaving(true)
      await api.post("/aluno-pontos/vincular", { alunoId, pontoId: selected })
      showToast("success", "Ponto de embarque salvo com sucesso!")
      onSaved()
      onClose()
    } catch {
      showToast("error", "Erro ao salvar ponto.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            Escolha seu ponto de embarque
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : pontos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum ponto de embarque disponível no momento.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pontos.map((p) => {
              const isSelected = selected === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{p.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.endereco}</p>
                    </div>
                    {isSelected && (
                      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  {p.rota?.nome && (
                    <p className="text-xs text-muted-foreground mt-1">Rota: {p.rota.nome}</p>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <Button className="w-full gap-2" onClick={handleSave} disabled={!selected || saving || loading}>
          {saving ? "Salvando..." : <><Save size={15} /> Salvar Ponto</>}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
