import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";

export default function AddPontoDialog({
  open, onClose, pontosDisponiveis, isProcessing, onAddPontos,
  addPontoSelecionados, setAddPontoSelecionados, addPontoSearch, setAddPontoSearch, pontos,
}) {
  function handleClose() {
    onClose();
    setAddPontoSearch("");
    setAddPontoSelecionados([]);
  }

  function handleConfirm() {
    const selecionados = pontos.filter((p) => addPontoSelecionados.includes(p.id));
    onAddPontos(selecionados);
  }

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Adicionar Pontos à Rota</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={addPontoSearch} onChange={(e) => setAddPontoSearch(e.target.value)} placeholder="Buscar pontos..." autoFocus />
          {pontosDisponiveis.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum ponto disponível. Todos os pontos já estão nesta rota.</p>
          ) : (
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {pontosDisponiveis.map((p) => {
                const selecionado = addPontoSelecionados.includes(p.id);
                return (
                  <label key={p.id} className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted text-sm ${selecionado ? 'border-primary bg-primary/5' : ''}`}>
                    <input type="checkbox" className="h-4 w-4" checked={selecionado} onChange={() => {
                      setAddPontoSelecionados((prev) =>
                        prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                      );
                    }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.endereco || "—"}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={isProcessing || addPontoSelecionados.length === 0}>Adicionar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
