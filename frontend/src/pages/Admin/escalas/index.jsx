import { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../services/api.js";
import { useToast } from "../../../hooks/useToast.js";
import { escalaManualSchema } from "../../../schemas/admin.js";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form, FormField, FormItem, FormControl, FormMessage,
} from "@/components/ui/form";

import {
  Calendar, Settings, RefreshCw, Users, Plus, Trash2, Eye, Route, Save,
} from "lucide-react";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function AdminEscalas() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [motoristas, setMotoristas] = useState([]);
  const [rotas, setRotas] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMes, setSelectedMes] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modoGeracao, setModoGeracao] = useState("automatica");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showConfirmAutomatica, setShowConfirmAutomatica] = useState(false);
  const [showConfirmManual, setShowConfirmManual] = useState(false);
  const anoAtual = new Date().getFullYear();

  const form = useForm({
    resolver: zodResolver(escalaManualSchema),
    defaultValues: { grupos: [{ motoristasIds: [] }] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "grupos",
  });

  const watchedGrupos = form.watch("grupos");

  const fetchMotoristas = useCallback(async () => {
    try { const { data } = await api.get("/motoristas?incluirInativos=false"); setMotoristas(data || []); }
    catch { showToast("error", "Erro ao carregar motoristas."); }
  }, [showToast]);

  const fetchRotas = useCallback(async () => {
    try { const { data } = await api.get("/rotas"); setRotas(data || []); }
    catch { showToast("error", "Erro ao carregar rotas."); }
  }, [showToast]);

  const fetchEscalas = useCallback(async () => {
    try {
      const { data } = await api.get(`/escalas/${anoAtual}`);
      setEscalas(data || []);
    } catch { setEscalas([]); }
    finally { setLoading(false); }
  }, [anoAtual]);

  useEffect(() => {
    document.title = "Admin - Gerenciar Escalas";
    setLoading(true);
    Promise.all([fetchMotoristas(), fetchRotas(), fetchEscalas()]);
  }, [fetchMotoristas, fetchRotas, fetchEscalas]);

  // === Geração Automática ===
  async function handleGerarAutomatica() {
    setShowConfirmAutomatica(false);
    setLoading(true);
    setIsProcessing(true);
    try {
      await api.post("/escalas/automatica", {
        ano: anoAtual,
        motoristasIds: motoristas.map((m) => m.id),
      });
      showToast("success", "Escala automática gerada com sucesso!");
      fetchEscalas();
    } catch (err) {
      showToast("error", err.response?.data?.error || "Erro ao gerar escala.");
    } finally { setIsProcessing(false); setLoading(false); }
  }

  // === Geração Manual ===
  function handleAddGrupo() {
    if (fields.length >= rotas.length) return showToast("warning", `Máximo de ${rotas.length} grupos (um por rota).`);
    append({ motoristasIds: [] });
  }

  function handleRemoveGrupo(index) {
    if (fields.length === 1) return showToast("warning", "É necessário pelo menos um grupo.");
    remove(index);
  }

  function handleGerarManual(values) {
    setShowConfirmManual(false);
    if (values.grupos.some((g) => g.motoristasIds.length === 0)) {
      return showToast("error", "Cada grupo deve ter pelo menos um motorista.");
    }
    if (values.grupos.length !== rotas.length) {
      return showToast("error", `Número de grupos (${values.grupos.length}) deve ser igual ao de rotas (${rotas.length}).`);
    }
    setLoading(true);
    setIsProcessing(true);
    api.post("/escalas/manual", { ano: anoAtual, distribuicao: values.grupos })
      .then(() => {
        showToast("success", "Escala manual gerada com sucesso!");
        fetchEscalas();
      })
      .catch((err) => {
        showToast("error", err.response?.data?.error || "Erro ao gerar escala manual.");
      })
      .finally(() => { setLoading(false); setIsProcessing(false); });
  }

  // === Reset ===
  async function handleApagarEscalas() {
    setShowResetDialog(false);
    setIsProcessing(true);
    try {
      await api.delete(`/escalas/${anoAtual}/reset`);
      showToast("success", "Escalas apagadas com sucesso!");
      fetchEscalas();
    } catch (err) {
      showToast("error", err.response?.data?.error || "Erro ao apagar escalas.");
    } finally { setIsProcessing(false); }
  }

  function openModal(escala) {
    setSelectedMes(escala);
    setShowModal(true);
  }

  const idsUsadosEmTodosGrupos = (watchedGrupos || []).flatMap((g) => g.motoristasIds);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Escalas ({anoAtual})</h1>
        </div>
        {escalas.length > 0 && (
          <Button variant="destructive" onClick={() => setShowResetDialog(true)} disabled={isProcessing}>
            <Trash2 className="mr-2 h-4 w-4" /> Apagar Tudo
          </Button>
        )}
      </div>

      {loading && escalas.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <>
          {escalas.length > 0 ? (
            <div className="rounded-md bg-primary/10 text-primary text-sm px-4 py-3 font-medium">
              Escalas já foram geradas para {anoAtual}. Confira os meses abaixo.
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Gerar Escalas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant={modoGeracao === "automatica" ? "default" : "outline"} onClick={() => setModoGeracao("automatica")}>
                    <Settings className="mr-2 h-4 w-4" /> Automática
                  </Button>
                  <Button variant={modoGeracao === "manual" ? "default" : "outline"} onClick={() => setModoGeracao("manual")}>
                    <Users className="mr-2 h-4 w-4" /> Manual
                  </Button>
                </div>

                {modoGeracao === "automatica" && (
                  <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                      Distribuir automaticamente {motoristas.length} motoristas entre {rotas.length} rotas, com rotação mensal.
                    </p>
                    <Button onClick={() => setShowConfirmAutomatica(true)} disabled={isProcessing}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {isProcessing ? "Gerando..." : "Gerar Escala Automática"}
                    </Button>
                  </div>
                )}

                {modoGeracao === "manual" && (
                  <Form {...form}>
                    <form>
                      <div className="space-y-4 rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            Distribuir motoristas em {rotas.length} grupo{rotas.length > 1 ? "s" : ""} (um por rota)
                          </p>
                          <Button variant="outline" size="sm" onClick={handleAddGrupo} disabled={fields.length >= rotas.length} type="button">
                            <Plus className="mr-2 h-4 w-4" /> Adicionar Grupo
                          </Button>
                        </div>

                        {fields.map((field, i) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={`grupos.${i}.motoristasIds`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <div className="rounded-md border p-3 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Grupo {i + 1}</p>
                                    <Button variant="ghost" size="icon" className="text-destructive h-6 w-6" onClick={() => handleRemoveGrupo(i)} type="button">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                  <FormControl>
                                    <div className="flex flex-wrap gap-1.5">
                                      {motoristas.map((m) => {
                                        const selected = formField.value?.includes(m.id) ?? false;
                                        const usedElsewhere = !selected && idsUsadosEmTodosGrupos.includes(m.id);
                                        return (
                                          <Badge
                                            key={m.id}
                                            variant={selected ? "default" : "outline"}
                                            className={`cursor-pointer transition ${usedElsewhere ? "opacity-30 cursor-not-allowed" : ""}`}
                                            onClick={() => {
                                              if (!usedElsewhere) {
                                                const current = formField.value || [];
                                                const newIds = selected
                                                  ? current.filter((id) => id !== m.id)
                                                  : [...current, m.id];
                                                formField.onChange(newIds);
                                              }
                                            }}
                                          >
                                            {m.nome}
                                            {selected && " ✕"}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}

                        <div className="flex justify-end">
                          <Button type="button" onClick={() => setShowConfirmManual(true)} disabled={isProcessing || fields.length !== rotas.length}>
                            <Save className="mr-2 h-4 w-4" />
                            {isProcessing ? "Gerando..." : "Gerar Escala Manual"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mês</TableHead>
                  <TableHead>Rotas e Motoristas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escalas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma escala cadastrada ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  escalas.map((e) => (
                    <TableRow key={`${e.ano}-${e.mes}`}>
                      <TableCell className="font-medium align-top pt-3">{meses[e.mes - 1] || e.mes}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {e.rotas?.map((r) => (
                            <div key={r.rota?.id} className="text-sm">
                              <span className="font-medium text-primary">{r.rota?.nome}:</span>{" "}
                              <span className="text-muted-foreground">
                                {r.motoristas?.map((m) => m.nome).join(", ") || "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-3">
                        <Badge variant={e.status === "ativo" ? "default" : "secondary"}>{e.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right align-top pt-3">
                        <Button size="sm" variant="ghost" onClick={() => openModal(e)}>
                          <Eye className="h-4 w-4 mr-1" /> Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog open={showModal} onOpenChange={(open) => { if (!open) { setShowModal(false); setSelectedMes(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" /> Detalhes — {selectedMes && meses[selectedMes.mes - 1]}
            </DialogTitle>
          </DialogHeader>
          {selectedMes && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rota</TableHead>
                    <TableHead>Motoristas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMes.rotas?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-4">Nenhuma rota nesta escala.</TableCell>
                    </TableRow>
                  ) : (
                    selectedMes.rotas?.map((r) => (
                      <TableRow key={r.rota?.id}>
                        <TableCell className="font-medium">{r.rota?.nome}</TableCell>
                        <TableCell>
                          {r.motoristas?.map((m) => m.nome).join(", ") || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar todas as escalas?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar TODAS as escalas de {anoAtual}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isProcessing} onClick={handleApagarEscalas}>Apagar Tudo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmAutomatica} onOpenChange={setShowConfirmAutomatica}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar escala automática?</AlertDialogTitle>
            <AlertDialogDescription>
              {motoristas.length} motoristas serão distribuídos entre {rotas.length} rota{rotas.length > 1 ? "s" : ""}, com rotação mensal entre os grupos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isProcessing} onClick={handleGerarAutomatica}>Gerar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmManual} onOpenChange={setShowConfirmManual}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar escala manual?</AlertDialogTitle>
            <AlertDialogDescription>
              {fields.length} grupo{fields.length > 1 ? "s" : ""} de motoristas serão distribuídos entre {rotas.length} rota{rotas.length > 1 ? "s" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isProcessing} onClick={() => form.handleSubmit(handleGerarManual)()}>Gerar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
