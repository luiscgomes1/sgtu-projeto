import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { useToast } from "../../hooks/useToast.js";
import { GlobalLoader } from "../../components/GlobalLoader.jsx";
import {
  FaBusAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaTimes,
  FaAngleUp,
  FaAngleDown,
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// ---------------- Modal de Criação ----------------
const PontoCreateModal = ({ onClose, onSave, isProcessing }) => {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");

  const handleSave = () => {
    if (!nome.trim()) return;
    onSave({ nome, endereco });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <FaMapMarkerAlt /> Novo Ponto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-lg focus:ring-green-500 focus:border-green-500"
            disabled={isProcessing}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-lg focus:ring-green-500 focus:border-green-500"
            disabled={isProcessing}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="w-full py-2 rounded-lg font-semibold transition bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
        >
          <FaSave /> Criar Ponto
        </button>
      </div>
    </div>
  );
};

// ---------------- Modal de Edição ----------------
const PontoEditModal = ({ ponto, onClose, onSave, isProcessing }) => {
  const [nome, setNome] = useState(ponto.pontos?.nome || "");
  const [endereco, setEndereco] = useState(ponto.pontos?.endereco || "");

  const houveAlteracao =
    nome.trim() !== (ponto.pontos?.nome || "") ||
    endereco.trim() !== (ponto.pontos?.endereco || "");

  const handleSave = () => {
    if (!houveAlteracao) return;
    onSave(ponto.pontos?.id, { nome, endereco });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <FaMapMarkerAlt /> Editar Ponto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-lg focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-1/2 py-2 rounded-lg font-semibold transition bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!houveAlteracao || isProcessing}
            className={`w-1/2 py-2 rounded-lg font-semibold transition ${
              houveAlteracao
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } flex items-center justify-center gap-2`}
          >
            <FaSave /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------- Página Principal ----------------
export default function AdminPontos() {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPonto, setSelectedPonto] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    document.title = "Admin - Gerenciar Pontos de Embarque";
    fetchRotasComPontos();
  }, []);

  async function fetchRotasComPontos() {
    try {
      setLoading(true);

      const { data: rotas } = await api.get("/rotas?incluirInativas=true");

      const rotasComPontos = await Promise.all(
        rotas.map(async (rota) => {
          const { data: pontos } = await api.get(
            `/rota-pontos/${rota.id}/pontos?incluirInativos=true`
          );
          const { data: isOrdered } = await api.get(
            `/rota-pontos/${rota.id}/pontos/IsOrdered`
          );
          return { ...rota, pontos, isOrdered, alteradoLocalmente: false };
        })
      );

      setRotas(rotasComPontos);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar rotas e pontos.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(payload) {
    setIsProcessing(true);
    try {
      await api.post(`/pontos`, { payload });
      showToast("success", "Ponto criado e vinculado a todas as rotas!");
      await fetchRotasComPontos();
      setShowCreateModal(false);
    } catch {
      showToast("error", "Erro ao criar ponto.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleEditSave(id, payload) {
    setIsProcessing(true);
    try {
      await api.put(`/pontos/${id}`, { payload });
      showToast("success", "Ponto atualizado com sucesso!");
      await fetchRotasComPontos();
      setSelectedPonto(null);
    } catch {
      showToast("error", "Erro ao atualizar ponto.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleToggleStatus(rotaId, pontoId, status) {
    setIsProcessing(true);
    const novoStatus = status === "ativo" ? "inativo" : "ativo";
    try {
      await api.patch(`/rota-pontos/${rotaId}/pontos/${pontoId}/status`, {
        status: novoStatus,
      });
      showToast("success", "Status atualizado!");
      await fetchRotasComPontos();
    } catch {
      showToast("error", "Erro ao atualizar status.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSaveOrder(rotaId, pontosOrdenados) {
    try {
      const ordens = pontosOrdenados.map((ponto, index) => ({
        id: ponto.pontos?.id,
        ordem: index + 1,
      }));

      if (ordens.length !== pontosOrdenados.length) {
        throw new Error("A ordem dos pontos está inconsistente.");
      }

      await api.put(`/rota-pontos/${rotaId}/pontos/ordem`, { ordens });

      showToast("success", "Ordem dos pontos atualizada com sucesso!");
      await fetchRotasComPontos();
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao atualizar ordem dos pontos.";
      showToast("error", msg);
    }
  }

  function moverPonto(rotaId, fromIndex, toIndex) {
    if (toIndex < 0) return;
    setRotas((prev) =>
      prev.map((rota) => {
        if (rota.id !== rotaId) return rota;
        const updated = [...rota.pontos];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return { ...rota, pontos: updated, alteradoLocalmente: true };
      })
    );
  }

  if (loading) return <GlobalLoader />;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-lg border">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-3 flex items-center gap-2">
        <FaMapMarkerAlt className="text-blue-600" /> Gerenciar Pontos de
        Embarque
      </h2>

      <button
        onClick={() => setShowCreateModal(true)}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700"
      >
        <FaPlus /> Novo Ponto Global
      </button>

      {rotas.map((rota) => (
        <div key={rota.id} className="mb-10">
          <h3 className="text-xl font-bold text-gray-700 mb-3 flex items-center gap-2">
            <FaBusAlt className="text-blue-500" /> {rota.nome}
          </h3>

          {!rota.isOrdered && (
            <p className="text-red-600 font-semibold mb-2">
              ⚠ A ordem desta rota não está definida. Por favor, organize os
              pontos.
            </p>
          )}

          {rota.pontos.length === 0 ? (
            <p className="text-gray-500 italic p-3 border rounded-lg bg-gray-50">
              Nenhum cadastrado ainda.
            </p>
          ) : (
            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) return;
                const updated = Array.from(rota.pontos);
                const [moved] = updated.splice(result.source.index, 1);
                updated.splice(result.destination.index, 0, moved);
                setRotas((prev) =>
                  prev.map((r) =>
                    r.id === rota.id
                      ? { ...r, pontos: updated, alteradoLocalmente: true }
                      : r
                  )
                );
              }}
            >
              <Droppable droppableId={rota.id}>
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-50 p-3 rounded-lg border"
                  >
                    {rota.pontos.map((ponto, index) => {
                      const status = String(ponto.status).toUpperCase();
                      const color =
                        status === "ATIVO" ? "bg-green-500" : "bg-red-500";

                      return (
                        <Draggable
                          key={String(ponto.pontos?.id)}
                          draggableId={String(ponto.pontos?.id)}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              className="p-3 bg-white border rounded-lg mb-2 flex justify-between items-center"
                            >
                              <div>
                                <p className="font-semibold">
                                  Ponto {index + 1} : {ponto.pontos?.nome}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Endereço:{" "}
                                  {ponto.pontos?.endereco || "Sem endereço"}
                                </p>
                              </div>

                              <div className="flex gap-2 items-center">
                                {/* Botões de ordenação manual */}
                                <button
                                  onClick={() =>
                                    moverPonto(rota.id, index, index - 1)
                                  }
                                  disabled={index === 0}
                                  className="text-gray-500 hover:text-gray-800 disabled:opacity-30"
                                >
                                  <FaAngleUp />
                                </button>
                                <button
                                  onClick={() =>
                                    moverPonto(rota.id, index, index + 1)
                                  }
                                  disabled={index === rota.pontos.length - 1}
                                  className="text-gray-500 hover:text-gray-800 disabled:opacity-30"
                                >
                                  <FaAngleDown />
                                </button>

                                {/* Status e ações */}
                                <span
                                  className={`px-2 py-1 rounded-full text-xs text-white ${color}`}
                                >
                                  {status}
                                </span>
                                <button
                                  onClick={() => setSelectedPonto(ponto)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() =>
                                    handleToggleStatus(
                                      rota.id,
                                      ponto.pontos?.id,
                                      ponto.status
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  {status === "ATIVO" ? (
                                    <FaToggleOn />
                                  ) : (
                                    <FaToggleOff />
                                  )}
                                </button>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}
          {rota.pontos.length > 0 && (
            <button
              onClick={() => handleSaveOrder(rota.id, rota.pontos)}
              disabled={
                isProcessing || (rota.isOrdered && !rota.alteradoLocalmente)
              }
              className="mt-3 bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40"
            >
              <FaSave className="inline mr-2" /> Salvar Ordem
            </button>
          )}
        </div>
      ))}

      {showCreateModal && (
        <PontoCreateModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
          isProcessing={isProcessing}
        />
      )}

      {selectedPonto && (
        <PontoEditModal
          ponto={selectedPonto}
          onClose={() => setSelectedPonto(null)}
          onSave={handleEditSave}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
