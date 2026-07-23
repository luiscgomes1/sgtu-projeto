import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../services/api.js";
import { useToast } from "../../../hooks/useToast.js";
import { motoristaSchema } from "../../../schemas/admin.js";
import {
  formatCPF, formatDate, formatTelefone,
} from "../../../utils/formatters.js";

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

import { Plus, IdCard, Eye, Pencil } from "lucide-react";

const camposFormulario = [
  { name: "nome", label: "Nome completo", placeholder: "Ex: João da Silva", type: "text" },
  { name: "cpf", label: "CPF", placeholder: "000.000.000-00", type: "text" },
  { name: "data_nascimento", label: "Data de Nascimento", type: "date" },
  { name: "telefone", label: "Telefone de contato", placeholder: "(00) 00000-0000", type: "text" },
  { name: "cnh", label: "Número da CNH", placeholder: "Ex: 12345678900", type: "text" },
  { name: "validade_cnh", label: "Validade da CNH", type: "date" },
];

const defaultValues = Object.fromEntries(camposFormulario.map((c) => [c.name, ""]));

export default function AdminMotoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [modalEditMode, setModalEditMode] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const { showToast } = useToast();

  const form = useForm({
    resolver: zodResolver(motoristaSchema),
    defaultValues,
  });

  const editForm = useForm({
    resolver: zodResolver(motoristaSchema),
    defaultValues,
  });

  const fetchMotoristas = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (filterStatus && filterStatus !== "todos") params.status = filterStatus;
      const { data } = await api.get("/motoristas/paginated", { params });
      setMotoristas(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao carregar motoristas.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus, showToast]);

  useEffect(() => {
    document.title = "Admin - Gerenciar Motoristas";
    fetchMotoristas();
  }, [fetchMotoristas]);

  useEffect(() => { setPage(1) }, [filterStatus, limit]);

  async function handleCreate(values) {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await api.post("/motoristas", values);
      showToast("success", "Motorista cadastrado com sucesso!");
      form.reset(defaultValues);
      await fetchMotoristas();
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao criar motorista. Verifique os dados.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdate(id, formData) {
    setIsProcessing(true);
    try {
      const { data } = await api.put(`/motoristas/${id}`, formData);
      setSelectedMotorista(data);
      showToast("success", "Motorista atualizado com sucesso!");
      await fetchMotoristas();
      return data;
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao atualizar motorista. Verifique os dados.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleToggleStatus(id, status) {
    setIsProcessing(true);
    const novoStatus = status === "ativo" ? "inativo" : "ativo";
    try {
      await api.patch(`/motoristas/${id}/status`, { status: novoStatus });
      setSelectedMotorista(null);
      showToast("success", `Motorista ${novoStatus === "ativo" ? "ativado" : "desativado"} com sucesso!`);
      await fetchMotoristas();
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao atualizar status.");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleOpenModal = (m) => {
    setSelectedMotorista(m);
    setModalEditMode(false);
    editForm.reset({
      nome: m.nome || "",
      cpf: m.cpf || "",
      data_nascimento: m.data_nascimento || "",
      telefone: m.telefone || "",
      cnh: m.cnh || "",
      validade_cnh: m.validade_cnh || "",
    });
  };

  const formatField = (value, field) => {
    if (!value) return "N/A";
    if (field === "data_nascimento" || field === "validade_cnh") return formatDate(value);
    if (field === "cpf") return formatCPF(value);
    if (field === "telefone") return formatTelefone(value);
    return value;
  };

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));
  const offset = (page - 1) * limit;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <IdCard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Motoristas</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> Novo Motorista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {camposFormulario.map((f) => (
                  <FormField key={f.name} control={form.control} name={f.name} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        <Input {...field} type={f.type || "text"} placeholder={f.placeholder || ""} disabled={isProcessing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isProcessing}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isProcessing ? "Cadastrando..." : "Cadastrar Motorista"}
                </Button>
              </div>
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
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Nascimento</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CNH</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {motoristas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum motorista encontrado.</TableCell>
                </TableRow>
              ) : (
                motoristas.map((m) => {
                  const isAtivo = m.status === "ativo";
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(m.data_nascimento)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatTelefone(m.telefone)}</TableCell>
                      <TableCell className="text-muted-foreground">{m.cnh}</TableCell>
                      <TableCell><Badge variant={isAtivo ? "default" : "secondary"}>{isAtivo ? "Ativo" : "Inativo"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenModal(m)}>
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

      <Dialog open={!!selectedMotorista} onOpenChange={(open) => { if (!open) { setSelectedMotorista(null); setModalEditMode(false); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-primary" /> Detalhes do Motorista
            </DialogTitle>
          </DialogHeader>
          {selectedMotorista && (
            <>
              {modalEditMode ? (
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit((values) => handleUpdate(selectedMotorista.id, values))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {camposFormulario.map(({ name, label, type }) => (
                        <FormField key={name} control={editForm.control} name={name} render={({ field }) => (
                          <FormItem>
                            <FormLabel>{label}</FormLabel>
                            <FormControl>
                              <Input {...field} type={type || "text"} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button type="submit" disabled={isProcessing}>Salvar</Button>
                      <Button variant="outline" onClick={() => { setModalEditMode(false); editForm.reset(); }}>Cancelar</Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {camposFormulario.map(({ name, label }) => (
                      <div key={name} className="space-y-1">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-base font-medium">{formatField(selectedMotorista[name], name)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" onClick={() => setModalEditMode(true)}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button
                      variant={selectedMotorista.status === "ativo" ? "destructive" : "default"}
                      onClick={() => handleToggleStatus(selectedMotorista.id, selectedMotorista.status)}
                      disabled={isProcessing}
                    >
                      {selectedMotorista.status === "ativo" ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
