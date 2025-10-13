import { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { useToast } from "../../hooks/useToast.js";
import { GlobalLoader } from "../../components/GlobalLoader.jsx";
import AdminDetailModal from "../../components/AdminDetailModal.jsx";
import { useSortableData } from "../../hooks/useSortableData.js";
import {
  FaPlus,
  FaIdCard,
  FaEye,
  FaSortAlphaDown,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import {
  formatCPF,
  formatDate,
  formatTelefone,
} from "../../../../backend/src/utils/functions.js";

export default function AdminMotoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    cnh: "",
    validade_cnh: "",
    telefone: "",
  });
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [filterStatus, setFilterStatus] = useState("todos");
  const { showToast } = useToast();

  const [modalEditMode, setModalEditMode] = useState(false);
  const [modalFormData, setModalFormData] = useState({});

  const cleanStatus = (status) =>
    String(status || "")
      .toUpperCase()
      .trim();

  const { sortedItems, requestSort, getSortIcon } = useSortableData(
    motoristas,
    {
      key: "nome",
      direction: "ascending",
    }
  );

  const iconMap = {
    FaSort: <FaSort className="text-gray-400" />,
    FaSortUp: <FaSortUp />,
    FaSortDown: <FaSortDown />,
  };

  const fetchMotoristas = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/motoristas?incluirInativos=true");
      if (data) {
        setMotoristas(data);
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar motoristas.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    document.title = "Admin - Gerenciar Motoristas";
    fetchMotoristas();
  }, [fetchMotoristas]);

  async function handleCreate(e) {
    e.preventDefault();

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await api.post("/motoristas", form);
      showToast("success", "Motorista cadastrado com sucesso!");

      setForm({
        nome: "",
        cpf: "",
        cnh: "",
        validade_cnh: "",
        telefone: "",
        data_nascimento: "",
      });
      await fetchMotoristas();
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Erro ao criar motorista. Verifique os dados.";
      showToast("error", msg);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdate(id, formData) {
    setIsProcessing(true);
    try {
      const { data } = await api.put(`/motoristas/${id}`, formData);

      setMotoristas((prev) => prev.map((m) => (m.id === id ? data : m)));

      setSelectedMotorista(data);

      showToast("success", "Motorista atualizado com sucesso!");
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Erro ao atualizar motorista. Verifique os dados.";
      showToast("error", msg);
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

      setMotoristas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: novoStatus } : m))
      );
      setSelectedMotorista(null);

      showToast(
        "success",
        `Motorista ${
          novoStatus === "ativo" ? "ativado" : "desativado"
        } com sucesso!`
      );
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao atualizar status.";
      showToast("error", msg);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleOpenModal = (m) => {
    setSelectedMotorista(m);
    setModalFormData(m);
    setModalEditMode(false);
  };

  const handleSaveMotorista = async () => {
    const updated = await handleUpdate(selectedMotorista.id, modalFormData);
    if (updated) setModalEditMode(false);
  };

  const handleCancelEdit = () => {
    setModalFormData(selectedMotorista);
    setModalEditMode(false);
  };

  const finalFilteredData = sortedItems.filter((m) =>
    filterStatus === "todos"
      ? true
      : cleanStatus(m.status) === filterStatus.toUpperCase()
  );

  if (loading) return <GlobalLoader />;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg border">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-3 flex items-center gap-2">
        <FaIdCard className="text-blue-600" /> Gerenciar Motoristas
      </h2>

      {/* Formulário */}
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg border"
      >
        {[
          {
            name: "nome",
            label: "Nome completo:",
            placeholder: "Ex: João da Silva",
          },
          { name: "cpf", label: "CPF:", placeholder: "000.000.000-00" },
          {
            name: "data_nascimento",
            label: "Data de Nascimento:",
            type: "date",
          },
          {
            name: "telefone",
            label: "Telefone de contato:",
            placeholder: "(00) 00000-0000",
          },
          {
            name: "cnh",
            label: "Número da CNH:",
            placeholder: "Ex: 12345678900",
          },
          { name: "validade_cnh", label: "Validade da CNH:", type: "date" },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {f.label}
            </label>
            <input
              type={f.type || "text"}
              placeholder={f.placeholder || ""}
              value={form[f.name]}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>
        ))}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition"
          >
            <FaPlus /> {isProcessing ? "Salvando..." : "Adicionar Motorista"}
          </button>
        </div>
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

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-100 text-blue-800 text-sm uppercase">
              <th
                className="p-3 font-bold cursor-pointer"
                onClick={() => requestSort("nome")}
              >
                <div className="flex items-center gap-1">
                  Nome {iconMap[getSortIcon("nome")]}
                </div>
              </th>
              <th
                className="p-3 font-bold cursor-pointer"
                onClick={() => requestSort("data_nascimento")}
              >
                <div className="flex items-center gap-1">
                  Data de Nascimento {iconMap[getSortIcon("data_nascimento")]}
                </div>
              </th>
              <th
                className="p-3 font-bold cursor-pointer"
                onClick={() => requestSort("telefone")}
              >
                <div className="flex items-center gap-1">
                  Telefone {iconMap[getSortIcon("telefone")]}
                </div>
              </th>
              <th className="p-3 font-bold">CNH</th>
              <th
                className="p-3 font-bold cursor-pointer"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status {iconMap[getSortIcon("status")]}
                </div>
              </th>
              <th className="p-3 font-bold text-right">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {finalFilteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Nenhum motorista encontrado.
                </td>
              </tr>
            ) : (
              finalFilteredData.map((m) => {
                const status = cleanStatus(m.status);
                const statusColor =
                  status === "ATIVO" ? "bg-green-500" : "bg-red-500";

                return (
                  <tr
                    key={m.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-gray-800">{m.nome}</td>
                    <td className="p-3 text-gray-700">
                      {formatDate(m.data_nascimento)}
                    </td>
                    <td className="p-3 text-gray-700">
                      {formatTelefone(m.telefone)}
                    </td>
                    <td className="p-3 text-gray-700">{m.cnh}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColor}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="p-3 flex justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(m)}
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

      {/* Modal */}
      {selectedMotorista && (
        <AdminDetailModal
          title={
            <>
              <FaIdCard /> Detalhes do Motorista
            </>
          }
          details={selectedMotorista}
          isProcessing={isProcessing}
          formData={modalFormData}
          editMode={modalEditMode}
          setEditMode={setModalEditMode}
          onClose={() => setSelectedMotorista(null)}
          onSave={handleSaveMotorista}
          onCancel={handleCancelEdit}
          onToggleStatus={() =>
            handleToggleStatus(selectedMotorista.id, selectedMotorista.status)
          }
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                field: "nome",
                label: "Nome Completo:",
              },
              {
                field: "cpf",
                label: "CPF:",
                format: formatCPF,
              },
              {
                field: "data_nascimento",
                label: "Data de Nascimento:",
                type: "date",
              },
              {
                field: "telefone",
                label: "Telefone:",
                format: formatTelefone,
              },
              { field: "cnh", label: "Número da CNH:" },
              {
                field: "validade_cnh",
                label: "Validade da CNH:",
                type: "date",
              },
            ].map(({ field, label, type }) => (
              <div key={field} className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                {modalEditMode ? (
                  <input
                    type={type || "text"}
                    value={modalFormData[field] || ""}
                    onChange={(e) =>
                      setModalFormData({
                        ...modalFormData,
                        [field]: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  />
                ) : (
                  <p className="text-gray-800 border-b border-gray-200 py-1">
                    {field === "data_nascimento" || field === "validade_cnh"
                      ? formatDate(selectedMotorista[field])
                      : field === "cpf"
                      ? formatCPF(selectedMotorista[field])
                      : field === "telefone"
                      ? formatTelefone(selectedMotorista[field])
                      : selectedMotorista[field] || "N/A"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AdminDetailModal>
      )}
    </div>
  );
}
