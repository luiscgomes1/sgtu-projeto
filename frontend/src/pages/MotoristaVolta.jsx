// frontend/src/pages/MotoristaVolta.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { GlobalLoader } from "../components/GlobalLoader.jsx";
import { Bus, CheckCircle2, XCircle, Clock, Redo } from "lucide-react";
import { formatTime } from "../utils/formatters.js";
const REFRESH_INTERVAL = 30000;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function MotoristaVolta() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedRota, setSelectedRota] = useState(null);

  const tokenRef = useRef(searchParams.get("token"));

  const fetchData = useCallback(async () => {
    const tk = tokenRef.current;
    if (!tk) {
      setError("Token de acesso não encontrado na URL.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/viagens/hoje/volta/status`, {
        headers: { 'x-access-token': tk },
      });
      setData(response.data);
      setLastUpdated(new Date());
      const rotas = Object.keys(response.data.resumoPorRota || {});
      setSelectedRota((prev) => prev ?? (rotas.length ? rotas[0] : null));
    } catch (err) {
      const msg =
        err.response?.data?.error || "Falha na comunicação com a API.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Painel de Volta - Motorista";

    fetchData();

    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !data) return <GlobalLoader />;
  if (error)
    return (
      <div className="text-center mt-10 p-6 bg-destructive/10 border border-destructive/30 rounded-lg max-w-lg mx-auto">
        <XCircle className="text-5xl text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-destructive mb-2">
          Acesso Negado ou Fora do Horário
        </h2>
        <p className="text-destructive">{error}</p>
      </div>
    );

  const rotas = Object.keys(data?.resumoPorRota || {});
  const resumo = selectedRota ? data.resumoPorRota[selectedRota] : null;

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-foreground mb-4 flex items-center">
          Painel de Embarque de Volta
        </h1>
        <p className="text-muted-foreground mb-4">
          Status em tempo real da confirmação de volta dos alunos que fizeram o
          check-in na ida.
        </p>

        <div className="flex justify-between items-center p-3 bg-warning/10 border-l-4 border-warning rounded mb-6">
          <span className="text-sm font-medium text-warning-foreground">
            <Clock className="inline mr-2" /> Última Atualização: {" "}
            {lastUpdated ? formatTime(lastUpdated) : "Carregando..."}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center"
          >
            <Redo className={`mr-1 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>

        <div className="mb-4">
          <div className="flex space-x-2">
            {rotas.length === 0 && (
              <div className="text-muted-foreground">Nenhuma rota encontrada hoje.</div>
            )}
            {rotas.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRota(r)}
                className={`px-4 py-2 rounded-md font-semibold ${
                  r === selectedRota ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-start gap-6">
          <div className="w-1/2 bg-card p-4 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-muted-foreground mb-3 flex items-center">
              <Bus className="mr-2" /> Ida - Confirmaram
            </h2>

            <div className="mb-4">
              <p className="font-semibold text-muted-foreground">Total: {resumo ? resumo.totalIda : 0}</p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {resumo?.detalhes?.map((aluno) => (
                <div key={aluno.id} className="flex justify-between p-2 rounded bg-muted/20">
                  <div>
                    <div className="font-medium">{aluno.nome}</div>
                    <div className="text-sm text-muted-foreground">{aluno.faculdade}</div>
                  </div>
                  <div className="text-sm text-primary font-semibold">Ida</div>
                </div>
              ))}
            </div>
          </div>


          <div className="w-1/2 bg-card p-4 rounded-lg shadow border">
            <h2 className="text-xl font-bold text-muted-foreground mb-3 flex items-center">
              <Bus className="mr-2" /> Volta - Status
            </h2>

            <div className="flex justify-between items-center bg-primary/5 p-3 rounded-md mb-4">
              <p className="font-semibold text-lg text-muted-foreground">
                Faltam: <span className="text-destructive">{resumo ? resumo.totalIda - resumo.totalVolta : 0}</span>
              </p>
              <p className="font-semibold text-lg text-muted-foreground">
                No Ônibus: <span className="text-green-500">{resumo ? resumo.totalVolta : 0}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-muted-foreground mb-2">No Ônibus</h3>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {resumo?.detalhes?.filter(a => a.confirmadoVolta).map(aluno => (
                    <div key={aluno.id} className="flex items-center p-2 rounded bg-green-500/10">
                      <CheckCircle2 className="text-green-500 mr-2" />
                      <div>
                        <div className="font-medium">{aluno.nome}</div>
                        <div className="text-sm text-muted-foreground">{aluno.telefone || ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-muted-foreground mb-2">Faltando</h3>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {resumo?.detalhes?.filter(a => !a.confirmadoVolta).map(aluno => (
                    <div key={aluno.id} className="flex items-center p-2 rounded bg-destructive/5">
                      <XCircle className="text-destructive mr-2" />
                      <div>
                        <div className="font-medium">{aluno.nome}</div>
                        <div className="text-sm text-muted-foreground">{aluno.telefone || ''}</div>
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
