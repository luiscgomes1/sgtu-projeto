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
} from "react-icons/fa";

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
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Reenvio de Documentos - SGTU";
    setAluno(user);
    setLoading(false);
  }, [user]);

  function handleFileChange(e) {
    const { name, files } = e.target;
    setDocumentos((prev) => ({ ...prev, [name]: files[0] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // ✅ Validação mínima
    if (
      !documentos.comprovante_matricula_url ||
      !documentos.comprovante_residencia_url ||
      !documentos.foto_url
    ) {
      setError("Por favor, selecione todos os documentos antes de enviar.");
      setSubmitting(false);
      return;
    }

    if (!aluno.usuario_id) {
      try {
        // faz upload dos novos arquivos
        const formData = new FormData();
        formData.append("files", documentos.comprovante_matricula_url);
        formData.append("files", documentos.comprovante_residencia_url);
        formData.append("files", documentos.foto_url);

        const resDocumentos = await api.post(`/upload/${aluno.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // ✅ Corrigido: usar path (não url)
        const [matricula, residencia, foto] = resDocumentos.data.files.map(
          (file) => file.path
        );

        // atualiza request com os paths dos documentos
        await api.patch(`/signup/${aluno.id}`, {
          comprovante_matricula_url: matricula,
          comprovante_residencia_url: residencia,
          foto_url: foto,
        });
        await refreshUser();
        alert(
          "Documentos reenviados com sucesso! Aguarde a análise do administrador."
        );
        navigate("/aluno");
      } catch (error) {
        console.error("Erro ao reenviar documentos:", error);
        setError("Não foi possível reenviar os documentos. Tente novamente.");
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        // cria um novo request na tabela signup_requests
        const payload = {
          usuario_id: aluno.usuario_id,
          nome: aluno.nome,
          email: aluno.usuarios?.email || aluno.email,
          cpf: aluno.cpf || null,
          rg: aluno.rg || null,
          telefone: aluno.telefone || null,
          data_nascimento: aluno.data_nascimento || null,
          endereco: aluno.endereco || null,
          tipo_sanguineo: aluno.tipo_sanguineo || null,
          curso_id: aluno.curso_id || null,
        };

        const { data: alunoReenvio } = await api.post(
          `/alunos/${aluno.usuario_id}/reenviar-documentos`,
          payload
        );

        // faz upload dos novos arquivos
        const formData = new FormData();
        formData.append("files", documentos.comprovante_matricula_url);
        formData.append("files", documentos.comprovante_residencia_url);
        formData.append("files", documentos.foto_url);

        const resDocumentos = await api.post(
          `/upload/${alunoReenvio.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        // ✅ Corrigido: usar path (não url)
        const [matricula, residencia, foto] = resDocumentos.data.files.map(
          (file) => file.path
        );

        // atualiza request com os paths dos documentos
        await api.patch(`/signup/${alunoReenvio.id}`, {
          comprovante_matricula_url: matricula,
          comprovante_residencia_url: residencia,
          foto_url: foto,
        });
        await refreshUser();

        alert(
          "Documentos reenviados com sucesso! Aguarde a análise do administrador."
        );
        navigate("/aluno");
      } catch (err) {
        console.error("Erro ao reenviar documentos:", err);
        setError("Não foi possível reenviar os documentos. Tente novamente.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  if (loading)
    return <p className="text-center mt-10 text-blue-600">Carregando...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!aluno) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
          <FaUpload className="mr-2" /> Reenvio de Documentos
        </h2>

        {/* Dados Pessoais - somente leitura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Nome
            </label>
            <input
              type="text"
              value={aluno.nome}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Email
            </label>
            <input
              type="text"
              value={aluno.usuarios?.email || aluno.email}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              CPF
            </label>
            <input
              type="text"
              value={aluno.cpf || "N/A"}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1 items-center">
              <FaGraduationCap className="mr-2" /> Curso
            </label>
            <input
              type="text"
              value={aluno.cursos?.nome || aluno.curso_nome || "N/A"}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-1 items-center">
              <FaUniversity className="mr-2" /> Faculdade
            </label>
            <input
              type="text"
              value={
                aluno.cursos?.faculdades?.nome || aluno.faculdade_nome || "N/A"
              }
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Upload de documentos */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold mb-1">
              📄 Comprovante de Matrícula
            </label>
            <input
              type="file"
              name="comprovante_matricula_url"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              📄 Comprovante de Residência
            </label>
            <input
              type="file"
              name="comprovante_residencia_url"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">🖼️ Foto 3x4</label>
            <input
              type="file"
              name="foto_url"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-semibold transition ${
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
              className="flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-400 hover:bg-gray-100 transition"
            >
              <FaArrowLeft /> Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
