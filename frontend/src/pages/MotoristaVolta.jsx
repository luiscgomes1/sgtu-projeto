// frontend/src/pages/MotoristaVolta.jsx
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import { GlobalLoader } from "../components/GlobalLoader.jsx";
import {
  FaBusAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRedo,
} from "react-icons/fa";
import { formatTime } from "../../../backend/src/utils/functions.js"; // Supondo um utilitário para formatar tempo

const REFRESH_INTERVAL = 30000; // 30 segundos

export default function MotoristaVolta() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const token = searchParams.get("token");

  const fetchData = useCallback(async () => {
    if (!token) {
      setError("Token de acesso não encontrado na URL.");
      setLoading(false);
      return;
    }

    const endpoint = `/viagens/hoje/volta/status?token=${token}`;

    try {
      if (!data) setLoading(true);
      setError(null);

      const response = await api.get(endpoint);
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Erro ao carregar status da volta:", err);
      const msg =
        err.response?.data?.error || "Falha na comunicação com a API.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    document.title = "Painel de Volta - Motorista";

    fetchData();

    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  const renderListaVolta = () => {
    if (!data || Object.keys(data.resumoPorRota).length === 0) {
      return (
        <p className="text-gray-600">
          Nenhuma presença de ida confirmada ainda para hoje.
        </p>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(data.resumoPorRota).map(([rotaNome, resumo]) => (
          <div
            key={rotaNome}
            className="bg-white p-4 rounded-lg shadow border border-blue-100"
          >
            <h3 className="text-xl font-bold text-blue-700 mb-3 flex items-center">
              <FaBusAlt className="mr-2" /> {rotaNome}
            </h3>

            {/* Resumo */}
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md mb-4">
              <p className="font-semibold text-lg text-gray-700">
                Faltam:{" "}
                <span className="text-red-600">
                  {resumo.totalIda - resumo.totalVolta}
                </span>{" "}
                alunos
              </p>
              <p className="font-semibold text-lg text-gray-700">
                No Ônibus:{" "}
                <span className="text-green-600">{resumo.totalVolta}</span>
              </p>
            </div>

            {/* Lista Detalhada */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {resumo.detalhes
                .sort((a, b) => a.confirmadoVolta - b.confirmadoVolta) // Faltantes primeiro
                .map((aluno) => (
                  <div
                    key={aluno.id}
                    className={`flex justify-between p-2 rounded ${
                      aluno.confirmadoVolta ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <span className="font-medium">{aluno.nome}</span>
                    <span
                      className={`text-sm font-semibold ${
                        aluno.confirmadoVolta
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {aluno.confirmadoVolta ? (
                        <FaCheckCircle className="inline mr-1" />
                      ) : (
                        <FaTimesCircle className="inline mr-1" />
                      )}
                      {aluno.confirmadoVolta ? "Confirmado" : "Faltando"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading && !data) return <GlobalLoader />;
  if (error)
    return (
      <div className="text-center mt-10 p-6 bg-red-100 border border-red-400 rounded-lg max-w-lg mx-auto">
        <FaTimesCircle className="text-5xl text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-800 mb-2">
          Acesso Negado ou Fora do Horário
        </h2>
        <p className="text-red-700">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4 flex items-center">
          Painel de Embarque de Volta
        </h1>
        <p className="text-gray-600 mb-4">
          Status em tempo real da confirmação de volta dos alunos que fizeram o
          check-in na ida.
        </p>

        {/* Status de Atualização */}
        <div className="flex justify-between items-center p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded mb-6">
          <span className="text-sm font-medium text-yellow-800">
            <FaClock className="inline mr-2" /> Última Atualização:{" "}
            {lastUpdated ? formatTime(lastUpdated) : "Carregando..."}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center"
          >
            <FaRedo className={`mr-1 ${loading ? "animate-spin" : ""}`} />{" "}
            Atualizar
          </button>
        </div>

        {renderListaVolta()}
      </div>
    </div>
  );
}
