import { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { useToast } from "../../hooks/useToast.js";
import { GlobalLoader } from "../../components/GlobalLoader.jsx";
import AdminDetailModal from "../../components/AdminDetailModal.jsx";
import { useSortableData } from "../../hooks/useSortableData.js";

import {
  FaPlus,
  FaBusAlt,
  FaAngleDown,
  FaAngleUp,
  FaEye,
  FaTrash,
  FaUniversity,
  FaHandPointDown,
  FaSort, FaSortUp, FaSortDown,
  FaSortAlphaDown
} from "react-icons/fa";

// =================== MODAL DETALHE DA ROTA ===================
const RotaDetailContent = ({
  rota,
  formData,
  setFormData,
  isProcessing,
  isUpdatingModal,
  setIsUpdatingModal,
  fetchFaculdades,
  faculdades: initialFaculdades,
  todasFaculdades: initialTodasFaculdades,
  editMode,
}) => {
  const [faculdadeSelecionada, setFaculdadeSelecionada] = useState('');
  const { showToast } = useToast();

  const [currentFaculdades, setCurrentFaculdades] = useState(initialFaculdades);
  const [currentTodasFaculdades, setCurrentTodasFaculdades] = useState(initialTodasFaculdades);
  


  useEffect(() => {
    setCurrentFaculdades(initialFaculdades);
  }, [initialFaculdades]);

  useEffect(() => {
    setCurrentTodasFaculdades(initialTodasFaculdades);
  }, [initialTodasFaculdades]);

  async function handleVincular() {
    if (!faculdadeSelecionada) return;
    setIsUpdatingModal(true);
    try {
      await api.post ("/rota-faculdades/vincular", {
        rotaId: rota.id,
        faculdadeId: faculdadeSelecionada,
      });

      showToast("success", "Faculdade vinculada com sucesso!");
      const novoVinculo = currentTodasFaculdades.find(f => String(f.id) === String(faculdadeSelecionada));

  // Keep the same item shape used elsewhere (id, nome)
  if (novoVinculo) setCurrentFaculdades(prev => [...prev, { id: novoVinculo.id, nome: novoVinculo.nome }]);
      setFaculdadeSelecionada("");
      fetchFaculdades();
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao vincular faculdade.";
      showToast("error", msg);
    } finally {
      setIsUpdatingModal(false);
    }
  }

  async function handleDesvincular(faculdadeId) {
    setIsUpdatingModal(true);
    try {
      await api.post ("/rota-faculdades/desvincular", {
        rotaId: rota.id,
        faculdadeId: faculdadeId,
      });
      showToast("success", "Faculdade desvinculada com sucesso!");
      setCurrentFaculdades(prev => prev.filter(f => String(f.faculdadeId) !== String(faculdadeId)));

      fetchFaculdades();
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao desvincular faculdade.";
      showToast("error", msg);
    } finally {
      setIsUpdatingModal(false);
    }
  }


  return (
    <>
      {/* Nome da Rota (Editável/Visualização) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Rota: </label>
        {editMode ? (
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing || isUpdatingModal}
          />
        ) : (
          <p className="text-2xl font-semibold text-gray-800 p-2 border-b border-gray-200">
            {rota.nome}
          </p>
        )}
      </div>

      {/* Lista de faculdades */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-base font-bold text-gray-700 flex items-center gap-2">
          Faculdades vinculadas: <FaHandPointDown className="text-blue-600" />
        </h4>
      </div>
      { currentFaculdades.length === 0 ? (
        <p className="text-gray-500">Nenhuma faculdade vinculada a esta rota.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {currentFaculdades.map((faculdade) => (
            <li key={faculdade.id} className="flex justify-between items-center border-b py-2">
              <span className="flex items-center gap-2">
                <FaUniversity className="text-blue-600" /> - {faculdade.nome}
              </span>
              {!editMode && (
                <button
                  onClick={() => handleDesvincular(faculdade.id)}
                  className="text-red-600 hover:text-red-800"
                  >
                  <FaTrash />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Vincular nova faculdade */}
      {!editMode && (
        <div className="flex gap-2 mt-3">
          <select
            value={faculdadeSelecionada}
            onChange={(e) => setFaculdadeSelecionada(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
            disabled={isUpdatingModal}
          >
            <option value="">Selecione uma faculdade</option>
            {currentTodasFaculdades
              .filter((f) => !currentFaculdades.some((v) => String(v.id) === String(f.id)))
              .map((faculdade) => (
                <option key={faculdade.id} value={faculdade.id}>
                  {faculdade.nome}
                </option>
              ))}
          </select>
          <button
            onClick={handleVincular}
            disabled={!faculdadeSelecionada || isUpdatingModal}
            className="w-35 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaPlus /> {isUpdatingModal ? "Processando..." : "Vincular"}
          </button>
        </div>
      )}
    </>
  );
}

// =================== LISTAGEM DE ROTAS ===================
export default function AdminRotas() {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nomeRota, setNomeRota] = useState("");
  const [selectedRota, setSelectedRota] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [modalFormData, setModalFormData] = useState({});
  const [modalEditMode, setModalEditMode] = useState(false);
  const [modalFaculdades, setModalFaculdades] = useState([]);
  const [modalTodasFaculdades, setModalTodasFaculdades] = useState([]);
  const [isUpdatingModal, setIsUpdatingModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");


  const { showToast } = useToast();
  const iconMap = { 'FaSort': <FaSort className="text-gray-400" />, 'FaSortUp': <FaSortUp />, 'FaSortDown': <FaSortDown /> };

  const cleanStatus = (status) =>
    String(status || "")
      .toUpperCase()
      .replace(/['":;]/g, "")
      .replace(/TEXT/g, "")
      .trim();

  const updateRotaInState = (id, newFields) => {
    setRotas((prevRotas) =>
      prevRotas.map((rota) =>
        rota.id === id ? { ...rota, ...newFields } : rota
      )
    );
  };

  const fetchRotas = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/rotas?incluirInativas=true");
      if (data) setRotas(data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar rotas.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    document.title = "Admin - Gerenciamento de Rotas";
    fetchRotas();
  }, [fetchRotas]);

  const fetchModalFaculdades = useCallback(async (rotaId) => {
    try {
      const { data } = await api.get(`/rota-faculdades/${rotaId}`);
      if (data) setModalFaculdades(data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar faculdades.";
      showToast("error", msg);
    }
  }, [showToast]);

  const fetchModalTodasFaculdades = useCallback(async () => {
    try {
      const { data } = await api.get("/faculdades?incluirInativas=false");
      if (data) setModalTodasFaculdades(data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar faculdades.";
      showToast("error", msg);
    }
  }, [showToast]);

  const { sortedItems, requestSort, getSortIcon } = useSortableData(rotas, {
    key: 'nome',
    direction: 'ascending',
  });

  const handleOpenModal = (rota) => {
    setSelectedRota(rota);
    setModalFormData(rota);
    setModalEditMode(false);

    fetchModalFaculdades(rota.id);
    fetchModalTodasFaculdades();
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!nomeRota.trim()) return;
    setIsProcessing(true);
    try {
      await api.post("/rotas", { nome: nomeRota });
      setNomeRota("");
      showToast("success", "Rota criada com sucesso!");
      await fetchRotas();
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao criar rota.";
      showToast("error", msg);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUpdate(id, nome) {
    if (!nome.trim()) {
      showToast("error", "O nome da rota não pode ser vazio.");
      return;
    }
    setIsProcessing(true);
    try {
      const { data } = await api.put(`/rotas/${id}`, { nome });

      updateRotaInState(id, { nome: data.nome });
      setSelectedRota((prev) => ({ ...prev, nome: data.nome }));
      setModalFormData((prev) => ({ ...prev, nome: data.nome }));

      showToast("success", "Nome da rota atualizado com sucesso!");
      return data;
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao atualizar nome da rota.";
      showToast("error", msg);
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

      showToast(
        "success",
        `Rota ${novoStatus === "ativo" ? "ativada" : "inativada"} com sucesso!`
      );
      return { status: novoStatus };
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao atualizar status da rota.";
      showToast("error", msg);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleSaveModal = async () => {
    if (modalEditMode) {
      const updated = await handleUpdate(selectedRota.id, modalFormData.nome);
      if (updated) setModalEditMode(false);
    }
  }

  const handleCancelModal = () => {
    setModalFormData(selectedRota);
    setModalEditMode(false);
  }

  const finalFilteredData = sortedItems
    .filter((m) =>
      filterStatus === "todos"
        ? true
        : cleanStatus(m.status) === filterStatus.toUpperCase()
    );


  if (loading) return <GlobalLoader />;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg border">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-3 flex items-center gap-2">
        <FaBusAlt className="text-blue-600" /> Gerenciar Rotas
      </h2>

      {/* Criar rota */}
      <form
        onSubmit={handleCreate}
        className="flex gap-3 mb-8 p-4 bg-gray-50 rounded-lg border"
      >
        <input
          type="text"
          value={nomeRota}
          onChange={(e) => setNomeRota(e.target.value)}
          placeholder="Nome da nova rota"
          className="flex-1 border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={isProcessing || !nomeRota.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
        >
          <FaPlus /> {isProcessing ? "Processando..." : "Adicionar Rota"}
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
              <th className="p-3 font-bold w-1/2 cursor-pointer" onClick={() => requestSort('nome')}>
                <div className="flex items-center gap-1">Nome da Rota {iconMap[getSortIcon('nome')]}</div>
              </th>
              <th className="p-3 font-bold w-1/2 cursor-pointer" onClick={() => requestSort('status')}>
                <div className="flex items-center gap-1">Status {iconMap[getSortIcon('status')]}</div>
              </th>
              <th className="p-3 font-bold text-right">Detalhes da Rota</th>
            </tr>
          </thead>
          <tbody>
            {finalFilteredData.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  Nenhuma rota encontrada.
                </td>
              </tr>
            ) : (
              finalFilteredData.map((rota) => {
                const statusExibicao = cleanStatus(rota.status);
                const statusColor =
                  statusExibicao === "ATIVO" ? "bg-green-500" : "bg-red-500";

                return (
                  <tr
                    key={rota.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-gray-800 font-medium">
                      {rota.nome}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 ${statusColor} w-fit`}
                      >
                        {statusExibicao === "ATIVO" ? (
                          <FaAngleUp />
                        ) : (
                          <FaAngleDown />
                        )}
                        {statusExibicao}
                      </span>
                    </td>

                    <td className="p-3 flex justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(rota)}
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

      {/* Renderiza o Modal */}
      {selectedRota && (
        <AdminDetailModal
          title={<><FaBusAlt /> Detalhes da Rota</>}
          details={selectedRota}
          isProcessing={isProcessing}
          formData={modalFormData}
          editMode={modalEditMode}
          setEditMode={setModalEditMode}
          onClose={() => setSelectedRota(null)}
          onSave={handleSaveModal}
          onCancel={handleCancelModal}
          onToggleStatus={() => handleToggleStatus(selectedRota.id, selectedRota.status)}
        >
        <RotaDetailContent
          rota={selectedRota}
          formData={modalFormData}
          setFormData={setModalFormData}
          isProcessing={isProcessing}
          isUpdatingModal={isUpdatingModal}
          setIsUpdatingModal={setIsUpdatingModal}
          fetchFaculdades={() => fetchModalFaculdades(selectedRota.id)}
          fetchTodasFaculdades={fetchModalTodasFaculdades}
          faculdades={modalFaculdades}
          todasFaculdades={modalTodasFaculdades}
          editMode={modalEditMode}
        />
        </AdminDetailModal>
      )}
    </div>
  );
}
