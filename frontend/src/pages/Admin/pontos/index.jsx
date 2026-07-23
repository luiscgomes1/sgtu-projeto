import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../services/api.js";
import { useToast } from "../../../hooks/useToast.js";
import { pontoSchema } from "../../../schemas/admin.js";

import { MapPin } from "lucide-react";
import { joinEndereco } from "../../../utils/formatters.js";

import PontoForm from "./PontoForm.jsx";
import PontoTable from "./PontoTable.jsx";
import RotaPontosList from "./RotaPontosList.jsx";
import PontoDetailDialog from "./PontoDetailDialog.jsx";
import AddPontoDialog from "./AddPontoDialog.jsx";

export default function AdminPontos() {
  const [rotas, setRotas] = useState([]);
  const [pontos, setPontos] = useState([]);
  const [pontosDaRota, setPontosDaRota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRotaId, setSelectedRotaId] = useState("");
  const [isOrdered, setIsOrdered] = useState(false);
  const [alteradoLocalmente, setAlteradoLocalmente] = useState(false);

  const [selectedPonto, setSelectedPonto] = useState(null);
  const [modalEditMode, setModalEditMode] = useState(false);

  const [showAddPontoDialog, setShowAddPontoDialog] = useState(false);
  const [addPontoSearch, setAddPontoSearch] = useState("");
  const [addPontoSelecionados, setAddPontoSelecionados] = useState([]);

  const [page, setPage] = useState(1);
  const limit = 10;

  const { showToast } = useToast();

  const form = useForm({
    resolver: zodResolver(pontoSchema),
    defaultValues: { nome: "", enderecoRua: "", enderecoNumero: "", enderecoBairro: "", enderecoCidade: "" },
  });

  const editForm = useForm({
    resolver: zodResolver(pontoSchema),
    defaultValues: { nome: "", enderecoRua: "", enderecoNumero: "", enderecoBairro: "", enderecoCidade: "" },
  });

  const fetchRotas = useCallback(async () => {
    try {
      const { data } = await api.get("/rotas?incluirInativas=true");
      if (data) setRotas(data);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao carregar rotas.");
    }
  }, [showToast]);

  const fetchPontos = useCallback(async () => {
    try {
      const { data } = await api.get("/pontos?incluirInativos=true");
      if (data) setPontos(data);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao carregar pontos.");
    }
  }, [showToast]);

  const fetchPontosDaRota = useCallback(async (rotaId) => {
    if (!rotaId) { setPontosDaRota([]); return; }
    try {
      const [{ data: pontos }, { data: ordered }] = await Promise.all([
        api.get(`/rota-pontos/${rotaId}/pontos?incluirInativos=true`),
        api.get(`/rota-pontos/${rotaId}/pontos/IsOrdered`),
      ]);
      if (pontos) setPontosDaRota(pontos);
      setIsOrdered(ordered);
      setAlteradoLocalmente(false);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao carregar pontos da rota.");
    }
  }, [showToast]);

  useEffect(() => {
    document.title = "Admin - Gerenciar Pontos de Embarque";
    setLoading(true);
    Promise.all([fetchRotas(), fetchPontos()]).finally(() => setLoading(false));
  }, [fetchRotas, fetchPontos]);

  useEffect(() => {
    fetchPontosDaRota(selectedRotaId);
  }, [selectedRotaId, fetchPontosDaRota]);

  async function handleCreatePonto(values) {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await api.post("/pontos", { nome: values.nome, endereco: joinEndereco(values) });
      form.reset({ nome: "", enderecoRua: "", enderecoNumero: "", enderecoBairro: "", enderecoCidade: "" });
      showToast("success", "Ponto criado com sucesso!");
      await Promise.all([fetchPontos(), fetchPontosDaRota(selectedRotaId)]);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao criar ponto.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdatePonto(id, fields) {
    setIsProcessing(true);
    try {
      await api.put(`/pontos/${id}`, fields);
      showToast("success", "Ponto atualizado com sucesso!");
      await Promise.all([fetchPontos(), fetchPontosDaRota(selectedRotaId)]);
      setSelectedPonto(null);
      setModalEditMode(false);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao atualizar ponto.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleTogglePontoStatus(id, status) {
    setIsProcessing(true);
    const novo = status === "ativo" ? "inativo" : "ativo";
    try {
      await api.patch(`/pontos/${id}/status`, { status: novo });
      showToast("success", `Ponto ${novo === "ativo" ? "ativado" : "inativado"}!`);
      await fetchPontos();
      setSelectedPonto(null);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao atualizar status.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleToggleRotaPontoStatus(pontoId, status) {
    if (!selectedRotaId) return;
    setIsProcessing(true);
    const novo = status === "ativo" ? "inativo" : "ativo";
    try {
      await api.patch(`/rota-pontos/${selectedRotaId}/pontos/${pontoId}/status`, { status: novo });
      showToast("success", `Ponto ${novo === "ativo" ? "ativado" : "inativado"} na rota!`);
      await fetchPontosDaRota(selectedRotaId);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao atualizar status.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSaveOrder() {
    if (!selectedRotaId) return;
    setIsProcessing(true);
    const ordens = pontosDaRota.map((p, i) => ({ id: p.pontoId, ordem: i + 1 }));
    try {
      await api.put(`/rota-pontos/${selectedRotaId}/pontos/ordem`, { ordens });
      showToast("success", "Ordem salva com sucesso!");
      await fetchPontosDaRota(selectedRotaId);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao salvar ordem.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleAddPontos(pontosParaAdicionar) {
    if (!selectedRotaId || pontosParaAdicionar.length === 0) return;
    setIsProcessing(true);
    const nextOrdem = pontosDaRota.length + 1;
    const ordens = pontosParaAdicionar.map((p, i) => ({ id: p.id, ordem: nextOrdem + i }));
    try {
      await api.put(`/rota-pontos/${selectedRotaId}/pontos/ordem`, { ordens });
      showToast("success", "Pontos adicionados à rota!");
      setShowAddPontoDialog(false);
      setAddPontoSearch("");
      setAddPontoSelecionados([]);
      await fetchPontosDaRota(selectedRotaId);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao adicionar pontos.");
    } finally {
      setIsProcessing(false);
    }
  }

  const total = pontos.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const paginatedData = pontos.slice(offset, offset + limit);

  const pontosDisponiveis = pontos.filter((p) => {
    const jaNaRota = pontosDaRota.some((rp) => String(rp.pontoId) === String(p.id));
    return !jaNaRota;
  }).filter((p) => !addPontoSearch || p.nome.toLowerCase().includes(addPontoSearch.toLowerCase()));

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(pontosDaRota);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setPontosDaRota(updated);
    setAlteradoLocalmente(true);
  };

  const moverPonto = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= pontosDaRota.length) return;
    const updated = Array.from(pontosDaRota);
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPontosDaRota(updated);
    setAlteradoLocalmente(true);
  };

  const handleViewPonto = (p) => {
    setSelectedPonto(p);
    setModalEditMode(false);
  };

  const handleCloseDetail = () => {
    setSelectedPonto(null);
    setModalEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Pontos de Embarque</h1>
      </div>

      <PontoForm form={form} isProcessing={isProcessing} onSubmit={handleCreatePonto} />
      <PontoTable
        data={paginatedData}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        offset={offset}
        onPageChange={setPage}
        onView={handleViewPonto}
      />

      <RotaPontosList
        rotas={rotas}
        selectedRotaId={selectedRotaId}
        onSelectRota={setSelectedRotaId}
        pontosDaRota={pontosDaRota}
        loading={loading}
        isOrdered={isOrdered}
        alteradoLocalmente={alteradoLocalmente}
        isProcessing={isProcessing}
        onToggleStatus={handleToggleRotaPontoStatus}
        onSaveOrder={handleSaveOrder}
        onAddPonto={() => setShowAddPontoDialog(true)}
        moverPonto={moverPonto}
        handleDragEnd={handleDragEnd}
      />

      <PontoDetailDialog
        selectedPonto={selectedPonto}
        open={!!selectedPonto}
        onClose={handleCloseDetail}
        isProcessing={isProcessing}
        onUpdate={handleUpdatePonto}
        onToggleStatus={handleTogglePontoStatus}
        editForm={editForm}
        modalEditMode={modalEditMode}
        setModalEditMode={setModalEditMode}
      />

      <AddPontoDialog
        open={showAddPontoDialog}
        onClose={() => setShowAddPontoDialog(false)}
        pontosDisponiveis={pontosDisponiveis}
        isProcessing={isProcessing}
        onAddPontos={handleAddPontos}
        addPontoSelecionados={addPontoSelecionados}
        setAddPontoSelecionados={setAddPontoSelecionados}
        addPontoSearch={addPontoSearch}
        setAddPontoSearch={setAddPontoSearch}
        pontos={pontos}
      />
    </div>
  );
}
