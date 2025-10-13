import { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { useToast } from "../../hooks/useToast.js";
import { GlobalLoader } from "../../components/GlobalLoader.jsx";

import {
  FaPlus,
  FaUniversity,
  FaEye,
  FaAngleDown,
  FaAngleUp,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSortAlphaDown
} from "react-icons/fa";
import AdminDetailModal from "../../components/AdminDetailModal.jsx";
import { useSortableData } from "../../hooks/useSortableData.js";
const iconMap = {
  FaSort: <FaSort className="text-gray-400" />,
  FaSortUp: <FaSortUp />,
  FaSortDown: <FaSortDown />,
};

export default function AdminFaculdades() {
  const [faculdades, setFaculdades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [selectedFaculdade, setSelectedFaculdade] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const { showToast } = useToast();

  const cleanStatus = (status) =>
    String(status || "")
      .toUpperCase()
      .trim();

  const fetchFaculdades = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/faculdades?incluirInativas=false");
      if (data) setFaculdades(data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar faculdades.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    document.title = "Admin - Gerenciamento de Faculdades";
    fetchFaculdades();
  }, [fetchFaculdades]);

  async function handleCreate(e) {
    e.preventDefault();

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await api.post("/faculdades", { nome, endereco });
      setNome("");
      setEndereco("");
      showToast("success", "Faculdade criada com sucesso!");
      await fetchFaculdades();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Erro ao criar faculdade.";
      showToast("error", msg);
    } finally {
      setIsProcessing(false);
    }
  }

  // Função de atualização unificada
  async function handleUpdate(id, fields) {
    setIsProcessing(true);
    try {
      const { data } = await api.put(`/faculdades/${id}`, fields);
      // Atualiza estado local e no modal
      setFaculdades((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...fields } : f))
      );

      setSelectedFaculdade(data);

      showToast("success", "Dados atualizados com sucesso!");
      return data;
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao atualizar faculdade.";
      showToast("error", msg);
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

      setFaculdades((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: novo } : f))
      );

      setSelectedFaculdade(null);

      showToast(
        "success",
        `Faculdade ${novo === "ativo" ? "ativada" : "inativada"} com sucesso!`
      );
      return { status: novo };
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao atualizar status.";
      showToast("error", msg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  // Use sortable hook
  const { sortedItems, requestSort, getSortIcon } = useSortableData(
    faculdades,
    {
      key: "nome",
      direction: "ascending",
    }
  );

  // modal form state for AdminDetailModal
  const [modalFormData, setModalFormData] = useState({});
  const [modalEditMode, setModalEditMode] = useState(false);

  const handleOpenModal = (f) => {
    setSelectedFaculdade(f);
    setModalFormData(f);
    setModalEditMode(false);
  };

  const handleModalSave = async () => {
    if (!selectedFaculdade) return;
    // Only send fields that matter
    const fields = {
      nome: (modalFormData.nome || "").trim(),
      endereco: (modalFormData.endereco || "").trim(),
    };

    // simple validation
    if (!fields.nome) {
      showToast("error", "O nome da faculdade não pode ser vazio.");
      return;
    }

    const result = await handleUpdate(selectedFaculdade.id, fields);
    if (result) {
      setModalEditMode(false);
      setSelectedFaculdade(null);
    }
  };

  const handleModalCancel = () => {
    setModalFormData(selectedFaculdade);
    setModalEditMode(false);
  };

  const finalFilteredData = sortedItems
    .filter((f) =>
      filterStatus === "todos"
        ? true
        : cleanStatus(f.status) === filterStatus.toUpperCase()
    );

  if (loading) return <GlobalLoader />;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg border">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-3 flex items-center gap-2">
        <FaUniversity className="text-blue-600" /> Gerenciar Faculdades
      </h2>

      {/* Criar faculdade */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 mb-8 p-4 bg-gray-50 rounded-lg border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da nova faculdade"
            className="border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isProcessing}
          />
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Endereço da faculdade"
            className="border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isProcessing}
          />
        </div>

        <button
          type="submit"
          // Ocupa apenas o espaço necessário, alinhado à esquerda
          disabled={isProcessing || !nome.trim() || !endereco.trim()}
          className="w-fit bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
        >
          <FaPlus /> {isProcessing ? "Processando..." : "Adicionar Faculdade"}
        </button>
      </form>
      {/* Filtros */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FaSortAlphaDown className="text-blue-700" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* Listagem */}
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-100 text-blue-800 text-sm uppercase">
              <th
                className="p-3 font-bold w-1/3 cursor-pointer"
                onClick={() => requestSort("nome")}
              >
                <div className="flex items-center gap-1">
                  Nome {iconMap[getSortIcon("nome")]}
                </div>
              </th>
              <th
                className="p-3 font-bold w-1/3 cursor-pointer"
                onClick={() => requestSort("endereco")}
              >
                <div className="flex items-center gap-1">
                  Endereço {iconMap[getSortIcon("endereco")]}
                </div>
              </th>
              <th
                className="p-3 font-bold w-1/6 cursor-pointer"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center justify-center gap-1">
                  Status {iconMap[getSortIcon("status")]}
                </div>
              </th>
              <th className="p-3 font-bold w-1/6 text-right">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {finalFilteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  Nenhuma faculdade encontrada.
                </td>
              </tr>
            ) : (
              finalFilteredData.map((f) => {
                const status = String(f.status).toUpperCase();
                const color =
                  status === "ATIVO" ? "bg-green-500" : "bg-red-500";

                return (
                  <tr
                    key={f.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-gray-800 font-medium">{f.nome}</td>
                    <td className="p-3 text-gray-600 text-sm truncate max-w-xs">
                      {f.endereco || "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 ${color} w-fit`}
                        >
                          {status === "ATIVO" ? <FaAngleUp /> : <FaAngleDown />}
                          {status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 flex justify-end">
                      <button
                        onClick={() => handleOpenModal(f)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-100 p-2 rounded-full transition"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedFaculdade && (
        <AdminDetailModal
          title={
            <>
              <FaUniversity /> Detalhes da Faculdade
            </>
          }
          details={selectedFaculdade}
          isProcessing={isProcessing}
          formData={modalFormData}
          editMode={modalEditMode}
          setEditMode={setModalEditMode}
          onClose={() => setSelectedFaculdade(null)}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
          onToggleStatus={() => handleToggleStatus(selectedFaculdade.id, selectedFaculdade.status)
          }
        >
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              {modalEditMode ? (
                <input
                  type="text"
                  value={modalFormData.nome || ""}
                  onChange={(e) =>
                    setModalFormData((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-lg focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-xl font-semibold text-gray-800 p-2 border-b border-gray-200">
                  {selectedFaculdade.nome}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              {modalEditMode ? (
                <input
                  type="text"
                  value={modalFormData.endereco || ""}
                  onChange={(e) =>
                    setModalFormData((prev) => ({
                      ...prev,
                      endereco: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-base focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-700 p-2 border-b border-gray-200">
                  {selectedFaculdade.endereco || "—"}
                </p>
              )}
            </div>
          </div>
        </AdminDetailModal>
      )}
    </div>
  );
}
