import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";

import { MapPin, Pencil } from "lucide-react";
import { joinEndereco, parseEndereco } from "../../../utils/formatters.js";

export default function PontoDetailDialog({
  selectedPonto, open, onClose, isProcessing, onUpdate, onToggleStatus, editForm, modalEditMode, setModalEditMode,
}) {
  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Detalhes do Ponto</DialogTitle>
        </DialogHeader>
        {selectedPonto && (
          <div className="space-y-4">
            {modalEditMode ? (
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit((values) => onUpdate(selectedPonto.id, { nome: values.nome, endereco: joinEndereco(values) }))} className="space-y-4">
                  <FormField control={editForm.control} name="nome" render={({ field }) => (
                    <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="enderecoRua" render={({ field }) => (
                    <FormItem><FormLabel className="text-muted-foreground">Rua</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={editForm.control} name="enderecoNumero" render={({ field }) => (
                      <FormItem><FormLabel className="text-muted-foreground">Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={editForm.control} name="enderecoBairro" render={({ field }) => (
                      <FormItem><FormLabel className="text-muted-foreground">Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={editForm.control} name="enderecoCidade" render={({ field }) => (
                    <FormItem><FormLabel className="text-muted-foreground">Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="flex gap-2 pt-2 border-t">
                    <Button type="submit" disabled={isProcessing}>Salvar</Button>
                    <Button variant="outline" onClick={() => { setModalEditMode(false); editForm.reset(); }}>Cancelar</Button>
                  </div>
                </form>
              </Form>
            ) : (
              <>
                <div><p className="text-sm text-muted-foreground">Nome</p><p className="text-xl font-semibold">{selectedPonto.nome}</p></div>
                <div><p className="text-sm text-muted-foreground">Endereço</p><p className="text-base">{selectedPonto.endereco || "—"}</p></div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => { editForm.reset({ ...parseEndereco(selectedPonto.endereco), nome: selectedPonto.nome }); setModalEditMode(true); }}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button variant={selectedPonto.status === "ativo" ? "destructive" : "default"} onClick={() => onToggleStatus(selectedPonto.id, selectedPonto.status)} disabled={isProcessing}>
                    {selectedPonto.status === "ativo" ? "Inativar" : "Ativar"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
