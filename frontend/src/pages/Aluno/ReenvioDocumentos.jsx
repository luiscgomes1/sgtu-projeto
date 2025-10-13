import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth.js";
import {
  FaUpload,
  FaSave,
  FaArrowLeft,
  FaGraduationCap,
  FaUniversity,
  FaSyncAlt,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaIdCard,
  FaPhone,
  FaMapMarkerAlt,
  FaTint,
  FaBirthdayCake,
  FaEnvelope,
} from "react-icons/fa"; // Adicionado mais ícones

export default function ReenvioDocumentos() {
  const { user, refreshUser } = useAuth();
  const [aluno, setAluno] = useState(null);
  const [documentos, setDocumentos] = useState({
    comprovante_residencia_url: null,
    comprovante_matricula_url: null,
    foto_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Determina se o usuário já foi aprovado e é um ALUNO (tem usuario_id)
  const isApprovedStudent = !!aluno?.usuario_id;

  // Lista de documentos necessários para iteração
  const DOC_FIELDS = [
    {
      name: "comprovante_matricula_url",
      label: "Comprovante de Matrícula",
      icon: FaFileAlt,
      accept: "image/*,application/pdf",
    },
    {
      name: "comprovante_residencia_url",
      label: "Comprovante de Residência",
      icon: FaFileAlt,
      accept: "image/*,application/pdf",
    },
    { name: "foto_url", label: "Foto 3x4", icon: FaUser, accept: "image/*" },
  ];

  useEffect(() => {
    document.title = "Reenvio de Documentos - SGTU";
    // Assume que o objeto 'user' do useAuth já é o objeto normalizado (aluno/signup)
    setAluno(user);
    setLoading(false);
  }, [user]);

  function handleFileChange(e) {
    const { name, files } = e.target;
    // Salva o objeto File no estado
    setDocumentos((prev) => ({ ...prev, [name]: files[0] }));
    setError(null); // Limpa o erro ao selecionar um arquivo
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validação Mínima: Verifica se todos os campos de documento têm um objeto File
    const allFilesSelected = DOC_FIELDS.every(
      (field) => documentos[field.name]
    );
    if (!allFilesSelected) {
      setError(
        "Por favor, selecione todos os três documentos antes de enviar."
      );
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("files", documentos.comprovante_matricula_url);
      formData.append("files", documentos.comprovante_residencia_url);
      formData.append("files", documentos.foto_url);

      let resDocumentos, payload, entityId;

      if (isApprovedStudent) {
        // Caso 1: Aluno APROVADO que está reenviando (Cria uma nova requisição na signup_requests)

        // 1. Cria o request de reenvio com os dados ATUAIS do aluno
        payload = {
          usuario_id: aluno.usuario_id,
          // Garante que todos os campos necessários são enviados, usando os dados do 'aluno'
          nome: aluno.nome,
          email: aluno.email,
          cpf: aluno.cpf,
          rg: aluno.rg,
          telefone: aluno.telefone,
          data_nascimento: aluno.data_nascimento,
          endereco: aluno.endereco,
          tipo_sanguineo: aluno.tipo_sanguineo,
          curso_id: aluno.curso_id,
        };
        const { data: alunoReenvio } = await api.post(
          `/alunos/${aluno.usuario_id}/reenviar-documentos`,
          payload
        );
        entityId = alunoReenvio.id; // ID do novo registro em signup_requests
      } else {
        // Caso 2: Usuário PENDENTE/REPROVADO reenviando (Atualiza o registro existente em signup_requests)
        entityId = aluno.id; // ID do registro em signup_requests
      }

      // 2. Faz o upload dos arquivos
      resDocumentos = await api.post(`/upload/${entityId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const [matricula, residencia, foto] = resDocumentos.data.files.map(
        (file) => file.path
      );

      // 3. Atualiza o registro (signup_requests) com os paths dos documentos
      await api.patch(`/signup/${entityId}`, {
        comprovante_matricula_url: matricula,
        comprovante_residencia_url: residencia,
        foto_url: foto,
        // Status deve ser setado para 'pendente' pelo backend nesta operação
      });

      await refreshUser(); // Atualiza o contexto global do usuário

      setSuccess(
        "Documentos reenviados com sucesso! Aguarde a análise do administrador."
      );

      setTimeout(() => navigate("/aluno"), 2000);
    } catch (error) {
      console.error("Erro ao reenviar documentos:", error);
      setError("Não foi possível reenviar os documentos. Verifique o console.");
    } finally {
      setSubmitting(false);
    }
  }

  // Componente Reutilizável para Dados Somente Leitura
  const ReadOnlyDetail = ({ icon, label, value }) => (
    <div className="flex flex-col">
      <label className="block text-gray-700 font-semibold mb-1 text-sm items-center space-x-2">
        {icon} <span>{label}</span>
      </label>
      <p className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-800 break-words cursor-not-allowed text-base shadow-inner">
        {value || "N/A"}
      </p>
    </div>
  );

  // Componente de Upload Personalizado
  const UploadField = ({ field }) => (
    <div className="flex flex-col">
      <label className="block font-semibold mb-2 items-center space-x-2">
        <field.icon className="text-blue-600" /> <span>{field.label}</span>
      </label>
      <label
        htmlFor={field.name}
        className={`w-full border-2 border-dashed px-4 py-3 rounded-lg cursor-pointer transition duration-150 text-center ${
          documentos[field.name]
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600"
        }`}
      >
        <input
          type="file"
          id={field.name}
          name={field.name}
          accept={field.accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center justify-center space-x-3">
          <FaUpload className="text-lg" />
          <span className="font-medium text-sm">
            {documentos[field.name]?.name || "Clique para selecionar o arquivo"}
          </span>
          {documentos[field.name] && (
            <FaCheckCircle className="text-lg text-green-600" />
          )}
        </div>
      </label>
    </div>
  );

  if (loading)
    return (
      <p className="text-center mt-10 text-xl text-blue-600 animate-pulse">
        Carregando dados do aluno...
      </p>
    );
  if (error && !aluno)
    return <p className="text-center mt-10 text-red-600 text-xl">{error}</p>;
  if (!aluno) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-8 space-y-8 border-t-4 border-blue-600">
        <h2 className="text-3xl font-extrabold text-blue-800 border-b pb-4 flex items-center space-x-3">
          <FaSyncAlt className="text-blue-600 text-2xl" />
          <span>Reenvio de Documentos</span>
        </h2>

        {/* Mensagens de feedback */}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg flex items-center space-x-3 shadow-sm">
            <FaCheckCircle /> <span className="font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center space-x-3 shadow-sm">
            <FaTimesCircle /> <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Alerta de Status */}
        <div
          className={`p-4 rounded-lg shadow-inner ${
            isApprovedStudent ? "bg-blue-100" : "bg-red-100"
          }`}
        >
          <p className="font-semibold text-gray-800 flex items-center space-x-2">
            <span>
              {isApprovedStudent
                ? "✅ Dados atuais do aluno ativo"
                : "⚠️ Dados do último pedido de cadastro"}
            </span>
          </p>
        </div>

        {/* Seção 1: Dados Pessoais (Somente Leitura) */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">
            Informações do Perfil
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReadOnlyDetail icon={<FaUser />} label="Nome" value={aluno.nome} />
            <ReadOnlyDetail
              icon={<FaEnvelope />}
              label="Email"
              value={aluno.email}
            />
            <ReadOnlyDetail icon={<FaIdCard />} label="CPF" value={aluno.cpf} />
            <ReadOnlyDetail
              icon={<FaPhone />}
              label="Telefone"
              value={aluno.telefone}
            />
            <ReadOnlyDetail
              icon={<FaBirthdayCake />}
              label="Nascimento"
              value={aluno.data_nascimento}
            />
            <ReadOnlyDetail
              icon={<FaTint />}
              label="Tipo Sanguíneo"
              value={aluno.tipo_sanguineo}
            />
          </div>
          <div className="pt-2">
            <ReadOnlyDetail
              icon={<FaMapMarkerAlt />}
              label="Endereço"
              value={aluno.endereco}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <ReadOnlyDetail
              icon={<FaUniversity />}
              label="Faculdade"
              value={aluno.faculdade_nome}
            />
            <ReadOnlyDetail
              icon={<FaGraduationCap />}
              label="Curso"
              value={aluno.curso_nome}
            />
          </div>
        </section>

        {/* Seção 2: Formulário de Upload */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 pt-6 border-t border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">
            Envio de Novos Documentos (Obrigatório)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DOC_FIELDS.map((field) => (
              <UploadField key={field.name} field={field} />
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-lg transition duration-200 shadow-md ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaSave /> {submitting ? "Enviando..." : "Reenviar Documentos"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/aluno")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-400 hover:bg-gray-100 transition font-semibold shadow-md"
            >
              <FaArrowLeft /> Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
