// frontend/src/pages/Admin/AdminCursos.jsx
import { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { useToast } from "../../hooks/useToast.js";
import { GlobalLoader } from "../../components/GlobalLoader.jsx";

import {
  FaPlus,
  FaBook,
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
export default function AdminCursos() {
  const [cursos, setCursos] = useState([]);
  const [faculdades, setFaculdades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [faculdadeId, setFaculdadeId] = useState("");
  const [selected, setSelected] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");


  const { showToast } = useToast();

  const cleanStatus = (status) =>
    String(status || "")
      .toUpperCase()
      .trim();


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: cursosData }, { data: faculdadesData }] =
        await Promise.all([
          api.get("/cursos?incluirInativos=true"),
          api.get("/faculdades?incluirInativas=false"),
        ]);
      if (cursosData) setCursos(cursosData);
      if (faculdadesData) setFaculdades(faculdadesData);
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Erro ao carregar cursos ou faculdades.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    document.title = "Admin - Gerenciamento de Cursos";
    fetchData();
  }, [fetchData]);

  async function handleCreate(e) {
    e.preventDefault();

    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await api.post("/cursos", { nome, faculdade_id: faculdadeId });
      setNome("");
      setFaculdadeId("");
      showToast("success", "Curso criado com sucesso!");
      await fetchData();
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Erro ao criar curso.";
      showToast("error", msg);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdate(id, fields) {
    setIsProcessing(true);
    try {
      await api.put(`/cursos/${id}`, fields);

      setCursos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...fields } : c))
      );
      showToast("success", "Curso atualizado com sucesso!");
      return { id, ...fields };
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Erro ao atualizar curso.";
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
      await api.patch(`/cursos/${id}`, { status: novo });
      setCursos((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: novo } : c))
      );

      showToast(
        "success",
        `Curso ${novo === "ativo" ? "ativado" : "inativado"} com sucesso!`
      );
      return { status: novo };
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "Erro ao atualizar status.";
      showToast("error", msg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  const { sortedItems, requestSort, getSortIcon } = useSortableData(
    cursos.map((c) => ({
      ...c,
      faculdadeNome:
        faculdades.find((f) => String(f.id) === String(c.faculdade_id))?.nome ||
        "",
    })),
    { key: "nome", direction: "ascending" }
  );

  // modal form state for AdminDetailModal
  const [modalFormData, setModalFormData] = useState({});
  const [modalEditMode, setModalEditMode] = useState(false);

  const handleOpenModal = (curso) => {
    setSelected(curso);
    setModalFormData(curso);
    setModalEditMode(false);
  };

  const handleModalSave = async () => {
    if (!selected) return;

    const fields = {
      nome: (modalFormData.nome || "").trim(),
      faculdade_id: modalFormData.faculdade_id,
    };

    if (!fields.nome) {
      showToast("error", "O nome do curso não pode ser vazio.");
      return;
    }

    const result = await handleUpdate(selected.id, fields);
    if (result) {
      setModalEditMode(false);
      setSelected(null);
    }
  };

  const handleModalCancel = () => {
    setModalFormData(selected);
    setModalEditMode(false);
  };

  const finalFilteredData = sortedItems.filter((m) =>
    filterStatus === "todos"
      ? true
      : cleanStatus(m.status) === filterStatus.toUpperCase()
  );

  if (loading) return <GlobalLoader />;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-lg border">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-3 flex items-center gap-2">
        <FaBook className="text-blue-600" /> Gerenciar Cursos
      </h2>

      {/* Criar curso */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col md:flex-row gap-3 mb-8 p-4 bg-gray-50 rounded-lg border"
      >
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do curso"
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          disabled={isProcessing}
        />
        <select
          value={faculdadeId}
          onChange={(e) => setFaculdadeId(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          disabled={isProcessing}
        >
          <option value="">Selecione a faculdade</option>
          {faculdades.map((f) => (
            <option key={f.id} value={String(f.id)}>
              {f.nome}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isProcessing || !nome.trim() || !faculdadeId}
          className="w-fit bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
        >
          <FaPlus /> {isProcessing ? "Processando..." : "Adicionar"}
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
              {/* Ordenação por Curso */}
              <th
                className="p-3 font-bold w-1/3 cursor-pointer hover:bg-blue-200 transition"
                onClick={() => requestSort("nome")}
              >
                <div className="flex items-center gap-1">
                  Curso {iconMap[getSortIcon("nome")]}
                </div>
              </th>
              {/* Ordenação por Faculdade */}
              <th
                className="p-3 font-bold w-1/3 cursor-pointer hover:bg-blue-200 transition"
                onClick={() => requestSort("faculdadeNome")}
              >
                <div className="flex items-center gap-1">
                  Faculdade {iconMap[getSortIcon("faculdadeNome")]}
                </div>
              </th>
              {/* Ordenação por Status */}
              <th
                className="p-3 font-bold cursor-pointer hover:bg-blue-200 transition"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center justify-center gap-1">
                  Status {iconMap[getSortIcon("status")]}
                </div>
              </th>
              <th className="p-3 font-bold text-right">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {finalFilteredData.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  Nenhum curso encontrado.
                </td>
              </tr>
            ) : (
              finalFilteredData.map((c) => {
                const status = String(c.status).toUpperCase();
                const color =
                  status === "ATIVO" ? "bg-green-500" : "bg-red-500";
                const faculdadeNome = c.faculdadeNome || "—";

                return (
                  <tr
                    key={c.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-gray-800 font-medium">{c.nome}</td>
                    <td className="p-3 text-gray-600">{faculdadeNome}</td>
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
                        onClick={() => handleOpenModal(c)}
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

      {selected && (
        <AdminDetailModal
          title={
            <>
              <FaBook /> Detalhes do Curso
            </>
          }
          details={selected}
          isProcessing={isProcessing}
          formData={modalFormData}
          editMode={modalEditMode}
          setEditMode={setModalEditMode}
          onClose={() => setSelected(null)}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
          onToggleStatus={async () => {
            const res = await handleToggleStatus(selected.id, selected.status);
            if (res) {
              setSelected(null);
            }
          }}
        >
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Curso
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
                  {selected.nome}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculdade
              </label>
              {modalEditMode ? (
                <select
                  value={modalFormData.faculdade_id || ""}
                  onChange={(e) =>
                    setModalFormData((prev) => ({
                      ...prev,
                      faculdade_id: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Selecione a faculdade
                  </option>
                  {faculdades.map((f) => (
                    <option key={f.id} value={String(f.id)}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-700 p-2 border-b border-gray-200">
                  {faculdades.find(
                    (f) => String(f.id) === String(selected.faculdade_id)
                  )?.nome || "—"}
                </p>
              )}
            </div>
          </div>
        </AdminDetailModal>
      )}
    </div>
  );
}
