/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";
import {
  FaCalendarAlt,
  FaCogs,
  FaSave,
  FaSync,
  FaUsers,
  FaPlus,
  FaTrash,
  FaEye,
  FaTimes,
  FaRoute,
  FaExclamationTriangle,
  FaTrashAlt,
} from "react-icons/fa";
import { GlobalLoader } from "../../components/GlobalLoader";

export default function AdminEscalas() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [motoristas, setMotoristas] = useState([]);
  const [rotas, setRotas] = useState([]);
  const [escalas, setEscalas] = useState([]);
  const [pares, setPares] = useState([{ motorista1_id: "", motorista2_id: "" }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMes, setSelectedMes] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modoGeracao, setModoGeracao] = useState("automatica");
  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    document.title = "Admin - Gerenciar Escalas";
    Promise.all([fetchMotoristas(), fetchRotas(), fetchEscalas()]);
  }, []);

  async function fetchMotoristas() {
    try {
      const { data } = await api.get("/motoristas?incluirInativos=false");
      setMotoristas(data);
    } catch {
      showToast("error", "Erro ao carregar motoristas.");
    }
  }

  async function fetchRotas() {
    try {
      const { data } = await api.get("/rotas");
      setRotas(data);
    } catch {
      showToast("error", "Erro ao carregar rotas.");
    }
  }

  async function fetchEscalas() {
    try {
      const { data } = await api.get(`/escalas/${anoAtual}`);
      setEscalas(data || []);
    } catch {
      showToast("error", "Erro ao carregar escalas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGerarAutomatica() {
    if (!window.confirm("Gerar escala automática para o ano atual?")) return;
    setLoading(true);
    setIsProcessing(true);
    try {
      const motoristasIds = motoristas.map((m) => m.id);
      await api.post("/escalas/automatica", { ano: anoAtual, motoristasIds });
      showToast("success", "Escala automática gerada com sucesso!");
      fetchEscalas();
    } catch (err) {
      showToast("error", err.response?.data?.error || "Erro ao gerar escala automática.");
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  }

  async function handleApagarEscalas() {
    if (!window.confirm("Tem certeza que deseja apagar TODAS as escalas e vínculos de motoristas deste ano?")) return;
    setIsProcessing(true);
    try {
      await api.delete(`/escalas/${anoAtual}/reset`);
      showToast("success", "Escalas e vínculos apagados com sucesso!");
      fetchEscalas();
    } catch (err) {
      showToast("error", err.response?.data?.error || "Erro ao apagar escalas.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleAddPar() {
    setPares([...pares, { motorista1_id: "", motorista2_id: "" }]);
  }

  function handleRemovePar(index) {
    if (pares.length === 1) return showToast("warning", "É necessário pelo menos um par.");
    setPares(pares.filter((_, i) => i !== index));
  }

  function handleParChange(index, field, value) {
    const newPares = [...pares];
    newPares[index][field] = value;
    setPares(newPares);
  }

  async function handleGerarManual() {
    const motoristasIds = pares.flatMap((p) => [p.motorista1_id, p.motorista2_id]);
    if (motoristasIds.some((id) => !id))
      return showToast("error", "Preencha todos os pares antes de gerar a escala.");
    if (motoristasIds.length % 2 !== 0)
      return showToast("error", "Número de motoristas deve ser par para gerar a escala manual.");

    if (!window.confirm("Gerar escala manual para o ano atual? Isso substituirá escalas existentes.")) return;

    setLoading(true);
    setIsProcessing(true);
    try {
      const paresArray = pares.map((p) => [p.motorista1_id, p.motorista2_id]);
      await api.post("/escalas/manual", { ano: anoAtual, pares: paresArray });
      showToast("success", "Escala manual gerada com sucesso!");
      fetchEscalas();
    } catch (err) {
      showToast("error", err.response?.data?.error || "Erro ao gerar escala manual.");
    } finally {
        setLoading(false);
      setIsProcessing(false);
    }
  }

  function openModal(escala) {
    setSelectedMes(escala);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedMes(null);
  }

  if (loading) return <GlobalLoader />;

  const motoristasSelecionados = pares.flatMap((p) => [
    p.motorista1_id,
    p.motorista2_id,
  ]).filter(Boolean);

  const motoristasDisponiveis = motoristas.filter(
    (m) => !motoristasSelecionados.includes(m.id)
  );

  const rota1 = rotas[0]?.nome || "Rota 1";
  const rota2 = rotas[1]?.nome || "Rota 2";

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-800 border-b pb-3 flex items-center gap-2">
          <FaCalendarAlt className="text-blue-600" /> Gerenciar Escalas ({anoAtual})
        </h2>

        {/* Botão de reset (teste/desenvolvimento) */}
        <button
          onClick={handleApagarEscalas}
          disabled={isProcessing}
          className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <FaTrashAlt /> Apagar Tudo
        </button>
      </div>

      {/* Se já existe escala, não mostra opções de criação */}
      {escalas.length > 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-green-800">
          <p className="font-semibold">
            ✅ Escalas já foram geradas para este ano.
          </p>
          <p className="text-sm text-green-700">
            Para editar ou visualizar, utilize as opções abaixo.
          </p>
        </div>
      ) : (
        <>
          {/* Seletor de modo de geração */}
          <div className="flex gap-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg font-semibold border transition ${
                modoGeracao === "automatica"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setModoGeracao("automatica")}
            >
              Gerar Automática
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold border transition ${
                modoGeracao === "manual"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setModoGeracao("manual")}
            >
              Gerar Manualmente
            </button>
          </div>

          {/* Automática */}
          {modoGeracao === "automatica" && (
            <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <FaCogs className="text-green-600" />
                <p className="font-medium text-gray-700">
                  Gerar escala automática com todos os motoristas ativos
                </p>
              </div>
              <button
                onClick={handleGerarAutomatica}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <FaSync /> {isProcessing ? "Gerando..." : "Gerar Escala Automática"}
              </button>
            </div>
          )}

          {/* Manual */}
          {modoGeracao === "manual" && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaUsers className="text-blue-600" /> Montar pares de motoristas
                </h3>
                <button
                  onClick={handleAddPar}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                >
                  <FaPlus /> Adicionar Par
                </button>
              </div>

              {pares.map((par, i) => {
                const idsUsados = pares
                  .flatMap((p, idx) =>
                    idx === i ? [] : [p.motorista1_id, p.motorista2_id]
                  )
                  .filter(Boolean);

                const motoristasDisponiveisParaPar = motoristas.filter(
                  (m) => !idsUsados.includes(m.id)
                );

                return (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 items-center">
                    <select
                      value={par.motorista1_id}
                      onChange={(e) =>
                        handleParChange(i, "motorista1_id", e.target.value)
                      }
                      className="border rounded-lg px-3 py-2 w-full"
                    >
                      <option value="">Selecione Motorista 1</option>
                      {motoristasDisponiveisParaPar.map((m) => (
                        <option
                          key={m.id}
                          value={m.id}
                          disabled={m.id === par.motorista2_id}
                        >
                          {m.nome}
                        </option>
                      ))}
                    </select>

                    <select
                      value={par.motorista2_id}
                      onChange={(e) =>
                        handleParChange(i, "motorista2_id", e.target.value)
                      }
                      className="border rounded-lg px-3 py-2 w-full"
                    >
                      <option value="">Selecione Motorista 2</option>
                      {motoristasDisponiveisParaPar.map((m) => (
                        <option
                          key={m.id}
                          value={m.id}
                          disabled={m.id === par.motorista1_id}
                        >
                          {m.nome}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleRemovePar(i)}
                      className="flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                );
              })}

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleGerarManual}
                  disabled={isProcessing}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition"
                >
                  <FaSave /> {isProcessing ? "Gerando..." : "Gerar Escala Manual"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* === Tabela === */}
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-100 text-blue-800 text-sm uppercase">
              <th className="p-3 font-bold">Mês</th>
              <th className="p-3 font-bold">Motorista 1</th>
              <th className="p-3 font-bold">Motorista 2</th>
              <th className="p-3 font-bold">Status</th>
              <th className="p-3 font-bold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {escalas.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Nenhuma escala cadastrada ainda.
                </td>
              </tr>
            ) : (
              escalas.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">{e.mes}</td>
                  <td className="p-3 text-gray-700">{e.motorista1?.nome || "—"}</td>
                  <td className="p-3 text-gray-700">{e.motorista2?.nome || "—"}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        e.status === "ativo" ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => openModal(e)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
                    >
                      <FaEye /> Ver Semanas
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* === Modal Semanal === */}
      {showModal && selectedMes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-xl"
            >
              <FaTimes />
            </button>

            <h3 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <FaRoute /> Escala Semanal - Mês {selectedMes.mes}
            </h3>

            <table className="w-full border rounded-lg">
              <thead>
                <tr className="bg-blue-100 text-blue-800">
                  <th className="p-2 text-center w-32">Semana</th>
                  <th className="p-2 text-left">{rota1}</th>
                  <th className="p-2 text-left">{rota2}</th>
                </tr>
              </thead>
              <tbody>
                {selectedMes.semanas?.map((sem) => (
                  <tr key={sem.semana} className="border-t">
                    <td className="p-2 text-center font-medium text-gray-800">
                      Semana {sem.semana}
                    </td>
                    <td className="p-2 text-green-700">{sem.rota1?.nome || "—"}</td>
                    <td className="p-2 text-blue-700">{sem.rota2?.nome || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isProcessing && <GlobalLoader />}
    </div>
  );
}
