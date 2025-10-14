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
import { formatTime } from "../../../backend/src/utils/functions.js";
const REFRESH_INTERVAL = 30000;

export default function MotoristaVolta() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedRota, setSelectedRota] = useState(null);

  const token = searchParams.get("token");

  const fetchData = useCallback(async () => {
    if (!token) {
      setError("Token de acesso não encontrado na URL.");
      setLoading(false);
      return;
    }

    const endpoint = `/viagens/hoje/volta/status?token=${token}`;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(endpoint);
      setData(response.data);
      setLastUpdated(new Date());
      const rotas = Object.keys(response.data.resumoPorRota || {});
      setSelectedRota((prev) => prev ?? (rotas.length ? rotas[0] : null));
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

  const rotas = Object.keys(data?.resumoPorRota || {});
  const resumo = selectedRota ? data.resumoPorRota[selectedRota] : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4 flex items-center">
          Painel de Embarque de Volta
        </h1>
        <p className="text-gray-600 mb-4">
          Status em tempo real da confirmação de volta dos alunos que fizeram o
          check-in na ida.
        </p>

        <div className="flex justify-between items-center p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded mb-6">
          <span className="text-sm font-medium text-yellow-800">
            <FaClock className="inline mr-2" /> Última Atualização: {" "}
            {lastUpdated ? formatTime(lastUpdated) : "Carregando..."}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center"
          >
            <FaRedo className={`mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>

        <div className="mb-4">
          <div className="flex space-x-2">
            {rotas.length === 0 && (
              <div className="text-gray-600">Nenhuma rota encontrada hoje.</div>
            )}
            {rotas.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRota(r)}
                className={`px-4 py-2 rounded-md font-semibold ${
                  r === selectedRota ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-start gap-6">
          <div className="w-1/2 bg-white p-4 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
              <FaBusAlt className="mr-2" /> Ida - Confirmaram
            </h2>

            <div className="mb-4">
              <p className="font-semibold text-gray-700">Total: {resumo ? resumo.totalIda : 0}</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {resumo?.detalhes?.map((aluno) => (
                <div key={aluno.id} className="flex justify-between p-2 rounded bg-gray-50">
                  <div>
                    <div className="font-medium">{aluno.nome}</div>
                    <div className="text-sm text-gray-500">{aluno.faculdade}</div>
                  </div>
                  <div className="text-sm text-blue-600 font-semibold">Ida</div>
                </div>
              ))}
            </div>
          </div>


          <div className="w-1/2 bg-white p-4 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
              <FaBusAlt className="mr-2" /> Volta - Status
            </h2>

            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md mb-4">
              <p className="font-semibold text-lg text-gray-700">
                Faltam: <span className="text-red-600">{resumo ? resumo.totalIda - resumo.totalVolta : 0}</span>
              </p>
              <p className="font-semibold text-lg text-gray-700">
                No Ônibus: <span className="text-green-600">{resumo ? resumo.totalVolta : 0}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">No Ônibus</h3>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {resumo?.detalhes?.filter(a => a.confirmadoVolta).map(aluno => (
                    <div key={aluno.id} className="flex items-center p-2 rounded bg-green-50">
                      <FaCheckCircle className="text-green-600 mr-2" />
                      <div>
                        <div className="font-medium">{aluno.nome}</div>
                        <div className="text-sm text-gray-500">{aluno.telefone || ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Faltando</h3>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {resumo?.detalhes?.filter(a => !a.confirmadoVolta).map(aluno => (
                    <div key={aluno.id} className="flex items-center p-2 rounded bg-red-50">
                      <FaTimesCircle className="text-red-600 mr-2" />
                      <div>
                        <div className="font-medium">{aluno.nome}</div>
                        <div className="text-sm text-gray-500">{aluno.telefone || ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
