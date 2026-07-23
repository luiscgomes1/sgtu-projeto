import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import {
  Bus, Plus, Save, GripVertical, ChevronUp, ChevronDown, ToggleLeft, ToggleRight,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function RotaPontosList({
  rotas, selectedRotaId, onSelectRota, pontosDaRota, loading, isOrdered,
  alteradoLocalmente, isProcessing, onToggleStatus, onSaveOrder, onAddPonto,
  moverPonto, handleDragEnd,
}) {
  const rotaSelecionada = rotas.find((r) => String(r.id) === String(selectedRotaId));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Bus className="h-4 w-4 text-primary" /> Pontos por Rota
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Select value={selectedRotaId} onValueChange={onSelectRota}>
              <SelectTrigger><SelectValue placeholder="Selecione uma rota" /></SelectTrigger>
              <SelectContent>
                {rotas.map((r) => (<SelectItem key={r.id} value={String(r.id)}>{r.nome}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          {rotaSelecionada && (
            <Button variant="outline" onClick={onAddPonto} disabled={isProcessing}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Ponto
            </Button>
          )}
        </div>

        {!selectedRotaId ? (
          <p className="text-sm text-muted-foreground text-center py-8">Selecione uma rota para gerenciar seus pontos.</p>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <>
            {!isOrdered && pontosDaRota.length > 0 && (
              <div className="rounded-md bg-destructive/10 text-destructive text-sm px-3 py-2 font-medium">
                A ordem dos pontos não está definida. Arraste ou use os botões para organizar.
              </div>
            )}

            {pontosDaRota.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum ponto vinculado a esta rota.</p>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={selectedRotaId}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                      {pontosDaRota.map((ponto, index) => {
                        const ativo = ponto.status === "ativo";
                        return (
                          <Draggable key={ponto.pontoId} draggableId={ponto.pontoId} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-center gap-3 rounded-md border px-3 py-2.5 bg-card">
                                <div {...provided.dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground">
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-mono text-muted-foreground w-6">#{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{ponto.ponto?.nome}</p>
                                  <p className="text-xs text-muted-foreground truncate">{ponto.ponto?.endereco || "Sem endereço"}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moverPonto(index, index - 1)} disabled={index === 0}>
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moverPonto(index, index + 1)} disabled={index === pontosDaRota.length - 1}>
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </Button>
                                  <Badge variant={ativo ? "default" : "secondary"} className="ml-1">{ativo ? "Ativo" : "Inativo"}</Badge>
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onToggleStatus(ponto.pontoId, ponto.status)} disabled={isProcessing}>
                                    {ativo ? <ToggleRight className="h-4 w-4 text-destructive" /> : <ToggleLeft className="h-4 w-4 text-primary" />}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {pontosDaRota.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={onSaveOrder} disabled={isProcessing || (!alteradoLocalmente && isOrdered)}>
                  <Save className="mr-2 h-4 w-4" /> Salvar Ordem
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
