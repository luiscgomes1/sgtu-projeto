import { useEffect, useState, useCallback } from "react";
import { FaMapMarkerAlt, FaSave, FaTimes } from "react-icons/fa";
import api from "../services/api.js";
import { useToast } from "../hooks/useToast.js";

const PontoSelectionModal = ({ alunoId, onClose, onSaved }) => {
  const [pontos, setPontos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchPontos = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/pontos?status=ativo"); // precisa existir no backend
      setPontos(data || []);
    } catch (error) {
      const msg =
        error.response?.data?.error || "Erro ao buscar pontos disponíveis.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPontos();
  }, [fetchPontos]);

  async function handleSave() {
    if (!selected) return;
    try {
      setSaving(true);
      await api.post("/aluno-pontos/vincular", { alunoId, pontoId: selected });
      showToast("success", "Ponto de embarque salvo com sucesso!");
      onSaved(); // callback pra atualizar dashboard
      onClose();
    } catch {
      showToast("error", "Erro ao salvar ponto.");
    }
    finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <FaMapMarkerAlt /> Escolha seu ponto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <p>Carregando pontos...</p>
        ) : (
          <select
            value={selected || ""}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
            disabled={saving}
          >
            <option value="">Selecione um ponto</option>
            {pontos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} - {p.endereco}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleSave}
          disabled={!selected || saving || loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          { saving ? 'Salvando...' : <FaSave /> } { saving ? '' : 'Salvar Ponto' }
        </button>
      </div>
    </div>
  );
};

export default PontoSelectionModal;
