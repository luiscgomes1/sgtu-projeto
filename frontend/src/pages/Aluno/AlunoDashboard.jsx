import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../hooks/useAuth.js";
import PontoSelectionModal from "../../components/PontoSelectionModal.jsx";
import { useToast } from "../../hooks/useToast.js";
import { GlobalLoader } from "../../components/GlobalLoader.jsx";

// Importação de Ícones
import {
  FaBusAlt,
  FaIdCard,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEnvelope,
  FaFingerprint,
  FaGraduationCap,
  FaUniversity,
  FaSyncAlt,
  FaTicketAlt,
  FaMapMarkerAlt,
  FaEdit,
} from "react-icons/fa";

export default function AlunoDashboard() {
  const { user } = useAuth();
  const [aluno, setAluno] = useState(null);
  const [ponto, setPonto] = useState(null);
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [carteirinha, setCarteirinha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Mapeamento de Status, adaptado para lidar com 'status' (signup) ou 'status_cadastro' (aluno)
  const STATUS_MAP = {
    // Status do Aluno APROVADO (na tabela 'alunos')
    ativo: {
      label: "Ativo",
      color: "bg-blue-600",
      icon: FaCheckCircle,
      textColor: "text-blue-600",
    },
    inativo: {
      label: "Inativo",
      color: "bg-red-600",
      icon: FaTimesCircle,
      textColor: "text-red-600",
    },

    // Status do Pedido de Cadastro (na tabela 'signup_requests')
    aprovado: {
      label: "Aprovado (Aguardando Ativação)",
      color: "bg-indigo-600",
      icon: FaCheckCircle,
      textColor: "text-indigo-600",
    },
    pendente: {
      label: "Pendente",
      color: "bg-yellow-600",
      icon: FaExclamationTriangle,
      textColor: "text-yellow-600",
    },
    reprovado: {
      label: "Reprovado",
      color: "bg-red-600",
      icon: FaTimesCircle,
      textColor: "text-red-600",
    },

    default: {
      label: "Desconhecido",
      color: "bg-gray-500",
      icon: FaExclamationTriangle,
      textColor: "text-gray-600",
    },
  };

  const getCurrentStatus = () => {
    if (!aluno) return null;

    if (aluno.status) {
      return aluno.status;
    }
    if (aluno.status_cadastro) {
      return aluno.status_cadastro;
    }
    return "default";
  };

  const currentStatusKey = getCurrentStatus();
  const statusInfo = STATUS_MAP[currentStatusKey] || STATUS_MAP.default;

  useEffect(() => {
    setAluno(user);
  }, [user]);

  async function fetchAlunoData(alunoId) {
    if (!alunoId) return;

    try {
      setLoading(true);

      const { data: pontoData } = await api.get(`/aluno-pontos/aluno/${alunoId}`);
      setPonto(pontoData || null);

      if (user.status === "ativo" && !pontoData) {
        setShowModal(true);
      }

      if(user.status === "ativo") {
        const { data: carteirinhaData } = await api.get(`/carteirinhas/minha-carteirinha/${alunoId}`);
        setCarteirinha(carteirinhaData || null);
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar dados complementares do aluno.";
      showToast("error", msg);
      setPonto(null);
      setCarteirinha(null);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = "Dashboard do Aluno - SGTU";
    setAluno(user);
    if (user?.usuario_id) {
      fetchAlunoData(user.usuario_id);
    } else {
      setLoading(false);
    }
  }, [user]);

  async function handleMarcarPresenca() {
    if (!canPerformActions) return;

    try {
      await api.post("/presencas/marcar-presenca");
      setMsg("Presença marcada com sucesso!");
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Erro ao marcar presença. Verifique as regras de marcação.";
      showToast("error", msg);
      setMsg(null);
    }
  }

  function handleReenviarDocumentos() {
    window.location.href = "/aluno/reenviar-documentos";
  }

  if (loading || !aluno) return <GlobalLoader />;
  if (!aluno) return null;

  // Ações de Presença e Carteirinha só estão disponíveis se o status for 'ativo' (aluno aprovado)
  const canPerformActions = currentStatusKey === "ativo";

  // Lógica corrigida: Ação de Reenvio está disponível SOMENTE se o status for 'reprovado'
  const canResubmit = currentStatusKey === "reprovado";

  const nomeCompleto = aluno.usuarios?.nome || aluno.nome || "Usuário";
  const emailCompleto = aluno.usuario?.email || aluno.email || "N/A";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6 flex items-center">
          <FaBusAlt className="mr-3 text-blue-600" />
          Bem-vindo, {nomeCompleto} 👋
        </h2>

        {/* ========================================= */}
        {/* CARD DE STATUS DO CADASTRO */}
        {/* ========================================= */}
        <div
          className={`p-4 rounded-lg shadow-md mb-6 flex items-center justify-between text-white ${statusInfo.color}`}
        >
          <div className="flex items-center">
            <statusInfo.icon className="text-3xl mr-3" />
            <h3 className="text-xl font-semibold">
              Status do Cadastro: {statusInfo.label.toUpperCase()}
            </h3>
          </div>

          <span className="text-sm font-light">
            {currentStatusKey === "pendente" &&
              "Seu pedido de cadastro está sendo revisado. Aguarde a aprovação."}
            {currentStatusKey === "aprovado" &&
              "Seu cadastro foi aprovado! A ativação final está pendente."}
            {currentStatusKey === "reprovado" &&
              "Seus documentos foram reprovados. Ação necessária para reenvio."}
            {currentStatusKey === "ativo" &&
              "Seu cadastro está ativo e validado. Boas viagens!"}
          </span>
        </div>

        {msg && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 flex items-center">
            <FaCheckCircle className="mr-2" />
            {msg}
          </div>
        )}

        {/* ========================================= */}
        {/* DADOS DO ALUNO E AÇÕES */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLUNA DE DADOS PESSOAIS E ACADÊMICOS */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
              <FaIdCard className="inline mr-2 text-gray-500" />
              Informações do Usuário
            </h3>

            <div className="space-y-3">
              {/* ATENÇÃO: Uso de &nbsp; para garantir o espaço */}
              <p className="flex items-center">
                <FaEnvelope className="text-blue-500 mr-3" />
                <span className="font-semibold text-gray-600">
                  Email:&nbsp;
                </span>{" "}
                {emailCompleto}
              </p>
              <p className="flex items-center">
                <FaFingerprint className="text-blue-500 mr-3" />
                <span className="font-semibold text-gray-600">
                  CPF:&nbsp;
                </span>{" "}
                {aluno.cpf || "N/A"}
              </p>
              <p className="flex items-center">
                <FaGraduationCap className="text-blue-500 mr-3" />
                <span className="font-semibold text-gray-600">
                  Curso:&nbsp;
                </span>{" "}
                {aluno.cursos?.nome || aluno.curso_nome || "N/A"}
              </p>
              <p className="flex items-center">
                <FaUniversity className="text-blue-500 mr-3" />
                <span className="font-semibold text-gray-600">
                  Faculdade:&nbsp;
                </span>{" "}
                {aluno.cursos?.faculdades?.nome ||
                  aluno.faculdade_nome ||
                  "N/A"}
              </p>
            </div>
          </div>

          {/* COLUNA DE AÇÕES */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
              <FaClock className="inline mr-2 text-gray-500" />
              Ações Rápidas
            </h3>

            {/* Ação 1: Marcar Presença */}
            <button
              onClick={handleMarcarPresenca}
              disabled={!canPerformActions}
              className={`w-full text-white py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
                canPerformActions
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed opacity-70"
              }`}
            >
              <FaFingerprint />
              <span>Marcar Presença</span>
            </button>

            {/* Ação 2: Reenviar Documentos (Apenas se REPROVADO) */}
            <button
              onClick={handleReenviarDocumentos}
              disabled={!canResubmit}
              className={`w-full text-white py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
                canResubmit
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-gray-400 cursor-not-allowed opacity-70"
              }`}
            >
              <FaSyncAlt />
              <span>Reenviar Documentos</span>
            </button>

            {/* Ação 3: Ver Carteirinha */}
            {carteirinha && canPerformActions && (
              <a
                href={carteirinha?.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
              >
                <FaTicketAlt />
                <span>Ver Carteirinha</span>
              </a>
            )}
            {/* Card do ponto atual */}
            {ponto && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                  <FaMapMarkerAlt /> Seu Ponto de Embarque
                </h3>
                <p className="mt-2 font-semibold">{ponto.nome}</p>
                <p className="text-sm text-gray-500">
                  {ponto.endereco}
                </p>
                <p className="text-sm text-gray-500">
                  Rota:{" "}
                  {ponto.rota?.nome ||
                    "Não há rota cadastrada para essa faculdade."}
                </p>

                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                  <FaEdit /> Alterar Ponto
                </button>
              </div>
            )}

            {/* Modal obrigatório ou de alteração */}
            {showModal && (
              <PontoSelectionModal
                alunoId={user.usuario_id}
                onClose={() => setShowModal(false)}
                onSaved={() => fetchAlunoData(user.usuario_id)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
