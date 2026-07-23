import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../services/api.js";
import { useToast } from "../../../hooks/useToast.js";
import { cursoSchema } from "../../../schemas/admin.js";

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

import { Plus, BookOpen, Eye, Pencil } from "lucide-react";

export default function AdminCursos() {
  const [cursos, setCursos] = useState([]);
  const [faculdades, setFaculdades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [modalEditMode, setModalEditMode] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const { showToast } = useToast();

  const form = useForm({
    resolver: zodResolver(cursoSchema),
    defaultValues: { nome: "", faculdade_id: "" },
  });

  const editForm = useForm({
    resolver: zodResolver(cursoSchema),
    defaultValues: { nome: "", faculdade_id: "" },
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filterStatus && filterStatus !== "todos") params.status = filterStatus;
      const [{ data: cursosData }, { data: faculdadesData }] = await Promise.all([
        api.get("/cursos/paginated", { params }),
        api.get("/faculdades?incluirInativas=false"),
      ]);
      if (cursosData) { setCursos(cursosData.data || []); setTotal(cursosData.total || 0); }
      if (faculdadesData) setFaculdades(faculdadesData);
    } catch (error) {
      showToast("error", error?.response?.data?.error || error?.message || "Erro ao carregar cursos ou faculdades.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus, showToast]);

  useEffect(() => {
    document.title = "Admin - Gerenciamento de Cursos";
    fetchData();
  }, [fetchData]);

  useEffect(() => { setPage(1) }, [filterStatus, limit]);

  async function handleCreate(values) {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await api.post("/cursos", { nome: values.nome, faculdade_id: values.faculdade_id });
      form.reset({ nome: "", faculdade_id: "" });
      showToast("success", "Curso criado com sucesso!");
      await fetchData();
    } catch (error) {
      showToast("error", error?.response?.data?.error || error?.message || "Erro ao criar curso.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdate(id, fields) {
    setIsProcessing(true);
    try {
      await api.put(`/cursos/${id}`, fields);
      showToast("success", "Curso atualizado com sucesso!");
      await fetchData();
      return { id, ...fields };
    } catch (error) {
      showToast("error", error?.response?.data?.error || error?.message || "Erro ao atualizar curso.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleToggleStatus(id, status) {
    setIsProcessing(true);
    const novo = status === "ativo" ? "inativo" : "ativo";
    try {
      await api.patch(`/cursos/${id}`, { status: novo });
      setSelected(null);
      showToast("success", `Curso ${novo === "ativo" ? "ativado" : "inativado"} com sucesso!`);
      await fetchData();
    } catch (error) {
      showToast("error", error?.response?.data?.error || error?.message || "Erro ao atualizar status.");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleOpenModal = (curso) => {
    setSelected(curso);
    setModalEditMode(false);
    editForm.reset({ nome: curso.nome || "", faculdade_id: String(curso.faculdadeId || "") });
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const offset = (page - 1) * limit;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Cursos</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> Novo Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Curso</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Ciência da Computação" disabled={isProcessing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="faculdade_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculdade</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isProcessing}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a faculdade" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculdades.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>{f.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isProcessing}>
                <Plus className="mr-2 h-4 w-4" />
                {isProcessing ? "Cadastrando..." : "Cadastrar Curso"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div />
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Faculdade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cursos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhum curso encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                cursos.map((c) => {
                  const isAtivo = c.status === "ativo";
                  const faculdadeNome = faculdades.find((f) => String(f.id) === String(c.faculdadeId))?.nome || "—";
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{faculdadeNome}</TableCell>
                      <TableCell>
                        <Badge variant={isAtivo ? "default" : "secondary"}>{isAtivo ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenModal(c)}>
                          <Eye className="h-4 w-4" />
                        </Button>
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

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setModalEditMode(false); } }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Detalhes do Curso
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {modalEditMode ? (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit((values) => handleUpdate(selected.id, values))} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Curso</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="faculdade_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faculdade</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a faculdade" />
                              </SelectTrigger>
                              <SelectContent>
                                {faculdades.map((f) => (
                                  <SelectItem key={f.id} value={String(f.id)}>{f.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 pt-2 border-t">
                      <Button type="submit" disabled={isProcessing}>Salvar</Button>
                      <Button variant="outline" onClick={() => { setModalEditMode(false); editForm.reset(); }}>Cancelar</Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nome do Curso</p>
                    <p className="text-xl font-semibold">{selected.nome}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Faculdade</p>
                    <p className="text-base">{faculdades.find((f) => String(f.id) === String(selected.faculdadeId))?.nome || "—"}</p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" onClick={() => setModalEditMode(true)}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button
                      variant={selected.status === "ativo" ? "destructive" : "default"}
                      onClick={() => handleToggleStatus(selected.id, selected.status)}
                      disabled={isProcessing}
                    >
                      {selected.status === "ativo" ? "Inativar" : "Ativar"}
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
