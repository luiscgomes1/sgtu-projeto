import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { Bus, Landmark, Plus, Trash2 } from "lucide-react";

function cleanStatus(status) {
  return String(status || "").toUpperCase().replace(/['":;]/g, "").replace(/TEXT/g, "").trim();
}

export default function RotaDetailDialog({
  selectedRota, open, onClose, isProcessing, isUpdatingModal, onToggleStatus,
  modalFaculdades, modalTodasFaculdades, faculdadeSelecionada, setFaculdadeSelecionada,
  onVincular, showConfirmVincular, setShowConfirmVincular,
  faculdadeParaDesvincular, setFaculdadeParaDesvincular,
  faculdadeParaDesvincularNome, setFaculdadeParaDesvincularNome, onDesvincular,
}) {
  const faculdadeSelecionadaNome = modalTodasFaculdades.find(f => String(f.id) === faculdadeSelecionada)?.nome || "";
  return (
    <>
      <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary" /> Detalhes da Rota
            </DialogTitle>
          </DialogHeader>

          {selectedRota && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nome da Rota</p>
                <p className="text-xl font-semibold">{selectedRota.nome}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Landmark className="h-4 w-4 text-primary" /> Faculdades vinculadas
                  </h4>
                </div>

                {modalFaculdades.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Nenhuma faculdade vinculada a esta rota.</p>
                ) : (
                  <ul className="space-y-1">
                    {modalFaculdades.map((fac) => (
                      <li key={fac.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span>{fac.nome}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setFaculdadeParaDesvincular(fac.id); setFaculdadeParaDesvincularNome(fac.nome); }} disabled={isUpdatingModal}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2 mt-3">
                  <Select value={faculdadeSelecionada} onValueChange={(val) => { setFaculdadeSelecionada(val); }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione uma faculdade" />
                    </SelectTrigger>
                    <SelectContent>
                      {modalTodasFaculdades.map((fac) => (
                        <SelectItem key={fac.id} value={String(fac.id)}>
                          {fac.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowConfirmVincular(true)} disabled={!faculdadeSelecionada || isUpdatingModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isUpdatingModal ? "..." : "Vincular"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant={cleanStatus(selectedRota.status) === "ATIVO" ? "destructive" : "default"}
                  onClick={() => onToggleStatus(selectedRota.id, selectedRota.status)}
                  disabled={isProcessing}
                >
                  {cleanStatus(selectedRota.status) === "ATIVO" ? "Inativar Rota" : "Ativar Rota"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmVincular} onOpenChange={setShowConfirmVincular}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vincular faculdade</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja vincular a faculdade <strong>{faculdadeSelecionadaNome}</strong> à rota &ldquo;<strong>{selectedRota?.nome}</strong>&rdquo;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingModal}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isUpdatingModal} onClick={onVincular}>Vincular</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!faculdadeParaDesvincular} onOpenChange={(open) => { if (!open) { setFaculdadeParaDesvincular(null); setFaculdadeParaDesvincularNome(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular faculdade</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja desvincular a faculdade <strong>{faculdadeParaDesvincularNome}</strong> da rota &ldquo;<strong>{selectedRota?.nome}</strong>&rdquo;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingModal}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isUpdatingModal} onClick={onDesvincular}>Desvincular</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
