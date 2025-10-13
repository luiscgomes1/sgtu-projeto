import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { useToast } from "../../hooks/useToast.js";
import {
  FaUserShield,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaIdCard,
  FaEnvelope,
  FaGraduationCap,
  FaPaperclip,
  FaUniversity,
  FaArrowLeft,
  FaCheck,
  FaBan,
  FaSyncAlt,
  FaPhone,
  FaBirthdayCake,
  FaTint,
  FaMapMarkerAlt,
  FaTicketAlt,
} from "react-icons/fa";
import { GlobalLoader } from "../../components/GlobalLoader.jsx";

export default function AdminRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [carteirinha, setCarteirinha] = useState(null);
  const { showToast } = useToast();

  // Mapeamento de Status para Cores e Ícones (Melhorado)
  const STATUS_MAP = {
    aprovado: { label: "Aprovado", color: "bg-green-600", icon: FaCheckCircle },
    pendente: { label: "Pendente", color: "bg-yellow-600", icon: FaClock },
    reprovado: { label: "Reprovado", color: "bg-red-600", icon: FaTimesCircle },
    default: { label: "Desconhecido", color: "bg-gray-500", icon: FaClock },
  };

  const statusInfo =
    STATUS_MAP[request?.status] ||
    STATUS_MAP[request?.status_cadastro] ||
    STATUS_MAP.default;

  const isApprovedAndFinal =
    request?.status_cadastro === "aprovado" || request?.usuario_id;
  const isPendingAnalysis = request?.status !== "aprovado";

  async function fetchCarteirinha(alunoId) {
    try {
      const { data } = await api.get(
        `/carteirinhas/minha-carteirinha/${alunoId}`
      );
      setCarteirinha(data || null);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao buscar carteirinha.";
      showToast("error", msg);
      setCarteirinha(null);
    }
  }

  useEffect(() => {
    if (request && isApprovedAndFinal) {
      const alunoId = request.usuario_id || request.id;
      fetchCarteirinha(alunoId);
    }
  }, [request, isApprovedAndFinal]);

  useEffect(() => {
    document.title = "Detalhes da Requisição - SGTU";

    async function fetchRequest() {
      try {
        const { data } = await api.get(`/signup/${id}`);
        setRequest(data);
      } catch {
        try {
          const { data } = await api.get(`/alunos/${id}`);
          setRequest(data);
        } catch (error) {
          const msg =
            error.response?.data?.error ||
            "Erro ao buscar detalhes da requisição.";
          showToast("error", msg);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRequest();
  }, [id]);

  async function handleApprove() {
    if (!window.confirm("Deseja realmente aprovar esta requisição?")) return;
    try {
      setProcessing(true);
      const endpoint = request.reenvio
        ? `/signup/${id}/approve-reenvio`
        : `/signup/${id}/approve`;
      await api.put(endpoint);
      alert("Requisição aprovada com sucesso!");
      navigate("/admin");
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao aprovar a requisição.";
      showToast("error", msg);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReprove() {
    if (!window.confirm("Deseja realmente reprovar esta requisição?")) return;
    try {
      setProcessing(true);
      await api.put(`/signup/${id}/reprove`);
      alert("Requisição reprovada.");
      navigate("/admin");
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao reprovar a requisição.";
      showToast("error", msg);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <GlobalLoader />;

  // Renderiza a seção de dados do usuário e acadêmicos
  // VERSÃO FINAL: Garante o espaçamento com "label: "
  const renderDetailItem = (icon, label, value) => (
    <div className="flex items-center text-gray-700">
      {icon}
      {/* Usamos o texto formatado no <span> para garantir o espaço */}
      <span className="font-semibold ml-1">{label}: </span>
      <span className="break-words ml-1">{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-3 flex items-center">
          <FaUserShield className="mr-3 text-2xl text-blue-600" />
          {isApprovedAndFinal
            ? `Perfil do Aluno: ${request.nome || request.usuarios?.nome}`
            : `Revisão de Cadastro: ${request.nome}`}
        </h2>

        {/* ========================================= */}
        {/* STATUS BAR (Destacado) */}
        {/* ========================================= */}
        <div
          className={`p-4 rounded-lg shadow-md mb-6 flex items-center justify-between text-white ${statusInfo.color}`}
        >
          <div className="flex items-center">
            <statusInfo.icon className="text-3xl mr-3" />
            <h3 className="text-xl font-semibold">
              Status Atual: {statusInfo.label.toUpperCase()}
            </h3>
          </div>
          {request.reenvio && (
            <span className="px-3 py-1 bg-white text-purple-700 font-bold rounded-full text-sm flex items-center space-x-1">
              <FaSyncAlt />
              <span>Pedido de Reenvio</span>
            </span>
          )}
        </div>

        {/* ========================================= */}
        {/* DADOS DETALHADOS E DOCUMENTOS */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLUNA 1: DADOS PESSOAIS E ACADÊMICOS */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
              Dados do Aluno
            </h3>
            <div className="space-y-3">
              {renderDetailItem(
                <FaEnvelope />,
                "Email",
                request.usuarios?.email
              )}
              {renderDetailItem(<FaIdCard />, "CPF", request.cpf)}
              {renderDetailItem(<FaIdCard />, "RG", request.rg)}
              {renderDetailItem(<FaPhone />, "Telefone", request.telefone)}
              {renderDetailItem(
                <FaBirthdayCake />,
                "Nascimento",
                request.data_nascimento
              )}
              {renderDetailItem(
                <FaTint />,
                "Tipo Sanguíneo",
                request.tipo_sanguineo
              )}
              {renderDetailItem(
                <FaMapMarkerAlt />,
                "Endereço",
                request.endereco
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mt-6 mb-4">
              Informações Acadêmicas
            </h3>
            <div className="space-y-3">
              {renderDetailItem(
                <FaUniversity />,
                "Faculdade",
                request.cursos?.faculdades?.nome || "N/A"
              )}
              {renderDetailItem(
                <FaGraduationCap />,
                "Curso",
                request.cursos?.nome || "N/A"
              )}
            </div>
          </div>

          {/* COLUNA 2: DOCUMENTOS E AÇÕES */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center">
              <FaPaperclip className="mr-2 text-base" />
              {isApprovedAndFinal
                ? `Documentos Atuais do Aluno`
                : `Documentos para Análise`}
            </h3>

            <ul className="space-y-3 p-3 border rounded-lg bg-gray-50">
              {/* Item Documento (Reutilizável) */}
              {request.comprovante_residencia_url && (
                <li className="flex justify-between items-center">
                  <span>Comprovante de Residência</span>
                  <a
                    href={request.comprovante_residencia_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 underline hover:text-blue-800 transition"
                  >
                    Visualizar
                  </a>
                </li>
              )}
              {request.comprovante_matricula_url && (
                <li className="flex justify-between items-center">
                  <span>Comprovante de Matrícula</span>
                  <a
                    href={request.comprovante_matricula_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 underline hover:text-blue-800 transition"
                  >
                    Visualizar
                  </a>
                </li>
              )}
              {request.foto_url && (
                <li className="flex justify-between items-center">
                  <span>Foto 3x4</span>
                  <a
                    href={request.foto_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-600 underline hover:text-blue-800 transition"
                  >
                    Visualizar
                  </a>
                </li>
              )}
              {carteirinha && isApprovedAndFinal && (
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
            </ul>

            {/* ========================================= */}
            {/* BOTÕES DE AÇÃO */}
            {/* ========================================= */}
            {request.status === "pendente" && (
              <div className="flex flex-col gap-3 mt-8">
                {/* BOTÃO DE CARTEIRINHA (NOVO) */}

                {isPendingAnalysis && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <FaCheck />
                      <span>
                        {processing ? "Aprovando..." : "Aprovar Requisição"}
                      </span>
                    </button>
                    <button
                      onClick={handleReprove}
                      disabled={processing}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <FaBan />
                      <span>
                        {processing ? "Reprovando..." : "Reprovar Requisição"}
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botão Voltar */}
        <button
          onClick={() => navigate("/admin")}
          className="mt-8 w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center space-x-2"
        >
          <FaArrowLeft />
          <span>Voltar para o Painel</span>
        </button>
      </div>
    </div>
  );
}
