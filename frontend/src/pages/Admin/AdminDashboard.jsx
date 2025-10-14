import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { GlobalLoader}  from "../../components/GlobalLoader.jsx";
import { useToast } from "../../hooks/useToast.js";
import {
  FaUserClock,
  FaCheckDouble,
  FaTimesCircle,
  FaEye,
  FaSyncAlt,
  FaTicketAlt,
  FaChartBar,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 5;

export default function AdminDashboard() {
  const [pendentes, setPendentes] = useState([]);
  const [totalPendentes, setTotalPendentes] = useState(0);
  const [totalAprovados, setTotalAprovados] = useState(0);
  const [totalRejeitados, setTotalRejeitados] = useState(0);
  const [pagePendentes, setPagePendentes] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchCounts = useCallback(async () => {
    try {
      const { data } = await api.get("/alunos/counts");
      if (data) {
        setTotalPendentes(data.pendentes || 0);
        setTotalAprovados(data.aprovados || 0);
        setTotalRejeitados(data.reprovados || 0);
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar contagens.";
      showToast("error", msg);
    }
  }, [showToast]);

  const fetchRequests = useCallback(async (status, page, setData, setTotal) => {
    try {
      if (status === "aprovado") {
        const { data } = await api.get("/alunos/paginated", {
          params: {
            status_cadastro: "aprovado",
            limit: ITEMS_PER_PAGE,
            offset: (page - 1) * ITEMS_PER_PAGE,
          },
        });
        setData(data.data);
        setTotal(data.total);
      } else {
        const { data } = await api.get("/signup/paginated", {
          params: {
            status,
            limit: ITEMS_PER_PAGE,
            offset: (page - 1) * ITEMS_PER_PAGE,
          },
        });
        setData(data.data);
        setTotal(data.total);
      }
    } catch (error) {
      const msg =
        error.response?.data?.error || "Erro ao carregar as requisições.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    document.title = "Dashboard Admin - SGTU";
    fetchRequests("pendente", pagePendentes, setPendentes, setTotalPendentes);
    fetchCounts();
  }, [pagePendentes, fetchRequests, fetchCounts]);

  const totalPagesPendentes = Math.ceil(totalPendentes / ITEMS_PER_PAGE);

  if (loading) return <GlobalLoader />;

  const RequestItem = ({ req, isApproved = false }) => (
    <li className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition duration-150 p-3 rounded-lg border border-gray-200">
      <span className="text-gray-800 font-medium">
        {req.usuarios?.nome || req.nome} - {req.cursos?.nome}
        {req.reenvio && (
          <span className="ml-3 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full flex items-center">
            <FaSyncAlt className="mr-1 text-xs" /> Reenvio
          </span>
        )}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() =>
            navigate(`/admin/requests/${req.id || req.usuario_id}`)
          }
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-1"
        >
          <FaEye />
          <span className="hidden sm:inline">Detalhes</span>
        </button>

        {isApproved && req.carteirinha_url && (
          <a
            href={req.carteirinha_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-1"
          >
            <FaTicketAlt />
            <span className="hidden sm:inline">Carteirinha</span>
          </a>
        )}
      </div>
    </li>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 flex items-center border-b pb-3">
          <FaChartBar className="mr-3 text-2xl text-blue-600" />
          Painel de Gerenciamento de Cadastros
        </h2>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-500 text-white p-5 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-light uppercase">Pendentes</p>
              <p className="text-3xl font-extrabold">{totalPendentes}</p>
            </div>
            <FaUserClock className="text-4xl opacity-75" />
          </div>
          <div className="bg-green-600 text-white p-5 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-light uppercase">Aprovados</p>
              <p className="text-3xl font-extrabold">{totalAprovados}</p>
            </div>
            <FaCheckDouble className="text-4xl opacity-75" />
          </div>
          <div className="bg-red-600 text-white p-5 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-light uppercase">Rejeitados</p>
              <p className="text-3xl font-extrabold">{totalRejeitados}</p>
            </div>
            <FaTimesCircle className="text-4xl opacity-75" />
          </div>
        </div>

        {/* Pendentes */}
        <section className="mb-10 p-5 border border-yellow-300 rounded-lg bg-yellow-50">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
            <FaUserClock className="mr-2" />
            Requisições Pendentes ({totalPendentes} total)
          </h3>

          {pendentes.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              🎉 Nenhuma requisição pendente. Tudo sob controle!
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {pendentes.map((req) => (
                  <RequestItem key={req.usuario_id || req.id} req={req} />
                ))}
              </ul>

              {totalPagesPendentes > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-6">
                  <button
                    onClick={() => setPagePendentes((p) => Math.max(p - 1, 1))}
                    disabled={pagePendentes === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition flex items-center"
                  >
                    <FaAngleLeft className="mr-1" /> Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {pagePendentes} de {totalPagesPendentes}
                  </span>
                  <button
                    onClick={() =>
                      setPagePendentes((p) =>
                        Math.min(p + 1, totalPagesPendentes)
                      )
                    }
                    disabled={pagePendentes === totalPagesPendentes}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition flex items-center"
                  >
                    Próxima <FaAngleRight className="ml-1" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
