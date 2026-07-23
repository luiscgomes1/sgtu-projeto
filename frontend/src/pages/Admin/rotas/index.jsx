import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../services/api.js";
import { useToast } from "../../../hooks/useToast.js";
import { useSortableData } from "../../../hooks/useSortableData.js";
import { rotaSchema } from "../../../schemas/admin.js";

import { Button } from "@/components/ui/button";
import { Bus } from "lucide-react";

import RotaForm from "./RotaForm.jsx";
import RotaTable from "./RotaTable.jsx";
import RotaDetailDialog from "./RotaDetailDialog.jsx";

function cleanStatus(status) {
  return String(status || "").toUpperCase().replace(/['":;]/g, "").replace(/TEXT/g, "").trim();
}

export default function AdminRotas() {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRota, setSelectedRota] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [modalFaculdades, setModalFaculdades] = useState([]);
  const [modalTodasFaculdades, setModalTodasFaculdades] = useState([]);
  const [isUpdatingModal, setIsUpdatingModal] = useState(false);
  const [faculdadeSelecionada, setFaculdadeSelecionada] = useState("");
  const [showConfirmVincular, setShowConfirmVincular] = useState(false);
  const [faculdadeParaDesvincular, setFaculdadeParaDesvincular] = useState(null);
  const [faculdadeParaDesvincularNome, setFaculdadeParaDesvincularNome] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const form = useForm({
    resolver: zodResolver(rotaSchema),
    defaultValues: { nome: "" },
  });

  const { showToast } = useToast();

  const updateRotaInState = (id, newFields) => {
    setRotas((prev) => prev.map((r) => (r.id === id ? { ...r, ...newFields } : r)));
  };

  const fetchRotas = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/rotas?incluirInativas=true");
      if (data) setRotas(data);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao carregar rotas.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    document.title = "Admin - Gerenciamento de Rotas";
    fetchRotas();
  }, [fetchRotas]);

  useEffect(() => { setPage(1) }, [filterStatus]);

  const fetchModalFaculdades = useCallback(async (rotaId) => {
    try {
      const { data } = await api.get(`/rota-faculdades/${rotaId}`);
      if (data) setModalFaculdades(data);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao carregar faculdades.");
    }
  }, [showToast]);

  const fetchModalTodasFaculdades = useCallback(async () => {
    try {
      const { data } = await api.get("/faculdades?incluirInativas=false&naoVinculadas=true");
      if (data) setModalTodasFaculdades(data);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao carregar faculdades.");
    }
  }, [showToast]);

  const { sortedItems, requestSort, getSortIcon } = useSortableData(rotas, {
    key: "nome",
    direction: "ascending",
  });

  const filteredData = sortedItems.filter((m) =>
    filterStatus === "todos" ? true : cleanStatus(m.status) === filterStatus.toUpperCase()
  );

  const total = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const paginatedData = filteredData.slice(offset, offset + limit);

  const handleOpenModal = (rota) => {
    setSelectedRota(rota);
    setFaculdadeSelecionada("");
    setFaculdadeParaDesvincular(null);
    setFaculdadeParaDesvincularNome("");
    fetchModalFaculdades(rota.id);
    fetchModalTodasFaculdades();
  };

  async function handleCreate(values) {
    setIsProcessing(true);
    try {
      await api.post("/rotas", { nome: values.nome });
      form.reset({ nome: "" });
      showToast("success", "Rota criada com sucesso!");
      await fetchRotas();
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao criar rota.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleToggleStatus(id, status) {
    setIsProcessing(true);
    const novoStatus = status === "ativo" ? "inativo" : "ativo";
    try {
      await api.patch(`/rotas/${id}/status`, { status: novoStatus });
      updateRotaInState(id, { status: novoStatus });
      setSelectedRota(null);
      showToast("success", `Rota ${novoStatus === "ativo" ? "ativada" : "inativada"} com sucesso!`);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao atualizar status.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleVincular() {
    if (!faculdadeSelecionada || !selectedRota) return;
    setShowConfirmVincular(false);
    setIsUpdatingModal(true);
    try {
      await api.post("/rota-faculdades/vincular", { rotaId: selectedRota.id, faculdadeId: faculdadeSelecionada });
      showToast("success", "Faculdade vinculada com sucesso!");
      setFaculdadeSelecionada("");
      await fetchModalFaculdades(selectedRota.id);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao vincular faculdade.");
    } finally {
      setIsUpdatingModal(false);
    }
  }

  async function handleDesvincular() {
    if (!selectedRota || !faculdadeParaDesvincular) return;
    setFaculdadeParaDesvincular(null);
    setIsUpdatingModal(true);
    try {
      await api.post("/rota-faculdades/desvincular", { rotaId: selectedRota.id, faculdadeId: faculdadeParaDesvincular });
      showToast("success", "Faculdade desvinculada com sucesso!");
      await fetchModalFaculdades(selectedRota.id);
    } catch (error) {
      showToast("error", error.response?.data?.error || "Erro ao desvincular faculdade.");
    } finally {
      setIsUpdatingModal(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bus className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Rotas</h1>
      </div>

      <RotaForm form={form} isProcessing={isProcessing} onSubmit={handleCreate} />

      <RotaTable
        data={paginatedData}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        offset={offset}
        onPageChange={setPage}
        filterStatus={filterStatus}
        onFilterChange={(v) => { setFilterStatus(v); setPage(1); }}
        requestSort={requestSort}
        getSortIcon={getSortIcon}
        onView={handleOpenModal}
      />

      <RotaDetailDialog
        selectedRota={selectedRota}
        open={!!selectedRota}
        onClose={() => setSelectedRota(null)}
        isProcessing={isProcessing}
        isUpdatingModal={isUpdatingModal}
        onToggleStatus={handleToggleStatus}
        modalFaculdades={modalFaculdades}
        modalTodasFaculdades={modalTodasFaculdades}
        faculdadeSelecionada={faculdadeSelecionada}
        setFaculdadeSelecionada={setFaculdadeSelecionada}
        onVincular={handleVincular}
        showConfirmVincular={showConfirmVincular}
        setShowConfirmVincular={setShowConfirmVincular}
        faculdadeParaDesvincular={faculdadeParaDesvincular}
        setFaculdadeParaDesvincular={setFaculdadeParaDesvincular}
        faculdadeParaDesvincularNome={faculdadeParaDesvincularNome}
        setFaculdadeParaDesvincularNome={setFaculdadeParaDesvincularNome}
        onDesvincular={handleDesvincular}
      />
    </div>
  );
}
