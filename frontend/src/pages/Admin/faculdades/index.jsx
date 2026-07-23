import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../services/api.js";
import { useToast } from "../../../hooks/useToast.js";
import { faculdadeSchema } from "../../../schemas/admin.js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";

import { Plus, Landmark, Eye, Pencil } from "lucide-react";

function parseEndereco(endereco) {
  if (!endereco) return { rua: "", numero: "", bairro: "", cidade: "" };
  const partes = endereco.split(",").map((p) => p.trim());
  return { rua: partes[0] || "", numero: partes[1] || "", bairro: partes[2] || "", cidade: partes[3] || "" };
}

function joinEndereco(parts) {
  return [parts.rua, parts.numero, parts.bairro, parts.cidade].map((p) => p.trim()).filter(Boolean).join(", ");
}

export default function AdminFaculdades() {
  const [faculdades, setFaculdades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaculdade, setSelectedFaculdade] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [modalEditMode, setModalEditMode] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const { showToast } = useToast();

  const form = useForm({
    resolver: zodResolver(faculdadeSchema),
    defaultValues: { nome: "", rua: "", numero: "", bairro: "", cidade: "" },
  });

  const editForm = useForm({
    resolver: zodResolver(faculdadeSchema),
    defaultValues: { nome: "", rua: "", numero: "", bairro: "", cidade: "" },
  });

  const fetchFaculdades = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filterStatus && filterStatus !== "todos") params.status = filterStatus;
      const { data } = await api.get("/faculdades/paginated", { params });
      setFaculdades(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao carregar faculdades.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus, showToast]);

  useEffect(() => {
    document.title = "Admin - Gerenciamento de Faculdades";
    fetchFaculdades();
  }, [fetchFaculdades]);

  useEffect(() => { setPage(1) }, [filterStatus, limit]);

  async function handleCreate(values) {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await api.post("/faculdades", { nome: values.nome, endereco: joinEndereco(values) });
      form.reset({ nome: "", rua: "", numero: "", bairro: "", cidade: "" });
      showToast("success", "Faculdade criada com sucesso!");
      await fetchFaculdades();
    } catch (error) {
      showToast("error", error.response?.data?.error || error.message || "Erro ao criar faculdade.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdate(id, fields) {
    setIsProcessing(true);
    try {
      const { data } = await api.put(`/faculdades/${id}`, fields);
      setSelectedFaculdade(data);
      showToast("success", "Dados atualizados com sucesso!");
      await fetchFaculdades();
      return data;
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao atualizar faculdade.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleToggleStatus(id, status) {
    setIsProcessing(true);
    const novo = status === "ativo" ? "inativo" : "ativo";
    try {
      await api.patch(`/faculdades/${id}`, { status: novo });
      setSelectedFaculdade(null);
      showToast("success", `Faculdade ${novo === "ativo" ? "ativada" : "inativada"} com sucesso!`);
      await fetchFaculdades();
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao atualizar status.");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleOpenModal = (f) => {
    setSelectedFaculdade(f);
    setModalEditMode(false);
    const end = parseEndereco(f.endereco);
    editForm.reset({ nome: f.nome || "", rua: end.rua, numero: end.numero, bairro: end.bairro, cidade: end.cidade });
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const offset = (page - 1) * limit;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Landmark className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Faculdades</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> Nova Faculdade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da faculdade</FormLabel>
                  <FormControl><Input {...field} placeholder="Ex: Universidade Federal do Triângulo Mineiro (UFTM)" disabled={isProcessing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div>
                <p className="text-sm font-medium mb-2">Endereço</p>
                <div className="space-y-3">
                  <FormField control={form.control} name="rua" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Rua</FormLabel>
                      <FormControl><Input {...field} placeholder="Ex: Av. da Universidade" disabled={isProcessing} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="numero" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Número</FormLabel>
                        <FormControl><Input {...field} placeholder="Ex: 2853" disabled={isProcessing} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="bairro" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Bairro</FormLabel>
                        <FormControl><Input {...field} placeholder="Ex: São Benedito" disabled={isProcessing} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="cidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Cidade</FormLabel>
                      <FormControl><Input {...field} placeholder="Ex: Uberaba" disabled={isProcessing} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <Button type="submit" disabled={isProcessing}>
                <Plus className="mr-2 h-4 w-4" />
                {isProcessing ? "Cadastrando..." : "Cadastrar Faculdade"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div />
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculdades.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma faculdade encontrada.</TableCell></TableRow>
              ) : (
                faculdades.map((f) => {
                  const isAtivo = f.status === "ativo";
                  return (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.nome}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-xs">{f.endereco || "—"}</TableCell>
                      <TableCell><Badge variant={isAtivo ? "default" : "secondary"}>{isAtivo ? "Ativo" : "Inativo"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenModal(f)}><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {Math.min(total, offset + 1)}–{Math.min(total, offset + limit)} de {total}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <span className="px-2">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Próxima
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedFaculdade} onOpenChange={(open) => { if (!open) { setSelectedFaculdade(null); setModalEditMode(false); } }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> Detalhes da Faculdade</DialogTitle>
          </DialogHeader>
          {selectedFaculdade && (
            <div className="space-y-4">
              {modalEditMode ? (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit((values) => handleUpdate(selectedFaculdade.id, { nome: values.nome, endereco: joinEndereco(values) }))} className="space-y-4">
                    <FormField control={editForm.control} name="nome" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="rua" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Rua</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={editForm.control} name="numero" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Número</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={editForm.control} name="bairro" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Bairro</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={editForm.control} name="cidade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Cidade</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-2 pt-2 border-t">
                      <Button type="submit" disabled={isProcessing}>Salvar</Button>
                      <Button variant="outline" onClick={() => { setModalEditMode(false); editForm.reset(); }}>Cancelar</Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div><p className="text-sm text-muted-foreground mb-1">Nome</p><p className="text-xl font-semibold">{selectedFaculdade.nome}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Endereço</p><p className="text-base">{selectedFaculdade.endereco || "—"}</p></div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" onClick={() => { editForm.reset({ ...parseEndereco(selectedFaculdade?.endereco), nome: selectedFaculdade.nome }); setModalEditMode(true); }}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant={selectedFaculdade.status === "ativo" ? "destructive" : "default"}
                      onClick={() => handleToggleStatus(selectedFaculdade.id, selectedFaculdade.status)} disabled={isProcessing}>
                      {selectedFaculdade.status === "ativo" ? "Inativar" : "Ativar"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
