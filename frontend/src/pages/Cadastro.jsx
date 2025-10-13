import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { IMaskInput } from "react-imask"; 
import { FaUpload, FaChevronDown, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaIdCard, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaGraduationCap, FaUniversity, FaTint, FaCheckCircle } from "react-icons/fa";
import { useToast } from "../hooks/useToast.js";
import { GlobalLoader } from "../components/GlobalLoader.jsx";


export default function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    rg: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    endereco: "",
    tipo_sanguineo: "",
    faculdade_id: "",
    curso_id: "",
  });

  const [files, setFiles] = useState({
    comprovante_matricula_url: null,
    comprovante_residencia_url: null,
    foto_url: null,
  });

  const [loading, setLoading] = useState(false);
  const [faculdades, setFaculdades] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    document.title = "Cadastro de Aluno - SGTU";
  }, []);

  useEffect(() => {
    async function fetchFaculdades() {
      try {
        // Rota de faculdades é pública
        const { data } = await api.get("/faculdades");
        setFaculdades(data);
      } catch (error) {
        const msg = error.response?.data?.error || "Erro ao buscar faculdades.";
        showToast(msg, "error");
      }
    }
    fetchFaculdades();
  }, []);

  function handleChange(e) {
    let { name, value } = e.target;

    if (name === "nome" || name === "endereco") {
      value = value.replace(/[^a-zA-Z\s\u00C0-\u00FF]/g, ""); // Permite letras e espaços
    }

    setForm({ ...form, [e.target.name]: value });
  }

  // Função onAccept para campos com IMaskInput
  function handleMaskedChange(name, value) {
    setForm({ ...form, [name]: value });
  }

  async function handleFaculdadeChange(e) {
    const faculdadeId = e.target.value;
    setForm({ ...form, faculdade_id: faculdadeId, curso_id: "" });

    try {
      // Rota de cursos por faculdade
      const { data } = await api.get(`/cursos/${faculdadeId}`);
      setCursos(data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao buscar cursos.";
      showToast(msg, "error");
    }
  }

  function handleFileChange(e) {
    const { name, files: selected } = e.target;
    setFiles({ ...files, [name]: selected[0] });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Cria request
      const { data: request } = await api.post("/signup/request", form);

      // Upload de arquivos
      const formData = new FormData();
      formData.append("files", files.comprovante_matricula_url);
      formData.append("files", files.comprovante_residencia_url);
      formData.append("files", files.foto_url);

      const uploadRes = await api.post(`/upload/${request.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const [matricula, residencia, foto] = uploadRes.data.files.map(
        (f) => f.path
      );

      // Atualiza signup com URLs
      await api.patch(`/signup/${request.id}`, {
        comprovante_matricula_url: matricula,
        comprovante_residencia_url: residencia,
        foto_url: foto,
      });

      showToast("Cadastro com sucesso! Aguarde aprovação do administrador.", "success");
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      showToast(error.response?.data?.error || "Erro ao enviar cadastro. Verifique os dados.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <GlobalLoader />;

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <section className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Formulário de Cadastro
        </h2>
        
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          
          {/* ========================================= */}
          {/* SEÇÃO 1: DADOS PESSOAIS */}
          {/* ========================================= */}
          <h3 className="md:col-span-2 text-xl font-semibold text-gray-800 border-b pb-2 mb-4 mt-2">
            Dados Pessoais
          </h3>

          {/* Nome Completo */}
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
            Nome Completo:
            <div className="relative mt-1">
              <input
                id="nome"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </label>

          {/* Email */}
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email:
            <div className="relative mt-1">
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </label>

          {/* Senha */}
          <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
            Senha:
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="senha"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                required
                className="w-full border rounded-lg pl-10 pr-10 py-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </label>
          
          {/* CPF com Máscara IMask */}
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
            CPF:
            <div className="relative mt-1">
              <IMaskInput
                mask="000.000.000-00"
                id="cpf"
                name="cpf"
                value={form.cpf}
                onAccept={(value) => handleMaskedChange('cpf', value)}
                required
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              />
              <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </label>

          {/* RG */}
          <label htmlFor="rg" className="block text-sm font-medium text-gray-700">
            RG:
            <div className="relative mt-1">
              <input
                id="rg"
                name="rg"
                value={form.rg}
                onChange={handleChange}
                required
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              />
              <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </label>

          {/* Telefone com Máscara Dinâmica IMask */}
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
            Telefone:
            <div className="relative mt-1">
              <IMaskInput
                mask=
                  "(00) 0 0000-0000"
                id="telefone"
                name="telefone"
                value={form.telefone}
                onAccept={(value) => handleMaskedChange('telefone', value)}
                required
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              />
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </label>
          
          {/* Data de nascimento */}
          <label
            htmlFor="data_nascimento"
            className="block text-sm font-medium text-gray-700"
          >
            Data de Nascimento:
            <div className="relative mt-1">
              <input
                type="date"
                id="data_nascimento"
                name="data_nascimento"
                value={form.data_nascimento}
                onChange={handleChange}
                required
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              />
              <FaBirthdayCake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </label>

          {/* Tipo sanguíneo */}
          <label
            htmlFor="tipo_sanguineo"
            className="block text-sm font-medium text-gray-700 relative"
          >
            Tipo Sanguíneo:
            <div className="relative mt-1">
              <select
                id="tipo_sanguineo"
                name="tipo_sanguineo"
                value={form.tipo_sanguineo}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 appearance-none focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 pl-10"
                required
              >
                <option value="">Selecione</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  )
                )}
              </select>
              <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </label>

          {/* Endereço */}
          <label
            htmlFor="endereco"
            className="md:col-span-2 block text-sm font-medium text-gray-700"
          >
            Endereço:
            <div className="relative mt-1">
              <input
                id="endereco"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                required
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              />
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </label>

          {/* ========================================= */}
          {/* SEÇÃO 2: DADOS ACADÊMICOS */}
          {/* ========================================= */}
          <h3 className="md:col-span-2 text-xl font-semibold text-gray-800 border-b pb-2 mb-4 mt-2">
            Dados Acadêmicos
          </h3>


          {/* Faculdade */}
          <label
            htmlFor="faculdade_id"
            className="block text-sm font-medium text-gray-700 relative"
          >
            Faculdade:
            <div className="relative mt-1">
              <select
                id="faculdade_id"
                name="faculdade_id"
                value={form.faculdade_id}
                onChange={handleFaculdadeChange}
                className="w-full border rounded-lg px-3 py-2 appearance-none focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 pl-10"
                required
              >
                <option value="">Selecione</option>
                {faculdades.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
              <FaUniversity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </label>

          {/* Curso */}
          <label
            htmlFor="curso_id"
            className="block text-sm font-medium text-gray-700 relative"
          >
            Curso:
            <div className="relative mt-1">
              <select
                id="curso_id"
                name="curso_id"
                value={form.curso_id}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 appearance-none focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 pl-10"
                required
                disabled={!form.faculdade_id}
              >
                <option value="">Selecione</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <FaGraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </label>

          {/* ========================================= */}
          {/* SEÇÃO 3: UPLOAD DE DOCUMENTOS */}
          {/* ========================================= */}
          <fieldset className="md:col-span-2 space-y-3 mt-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4 mt-2">
                Documentos Obrigatórios
            </h3>
            <div className="space-y-4">
              {/* Comprovante de Matrícula */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Comprovante de Matrícula:
                </span>
                <input
                  type="file"
                  id="comprovante_matricula_url"
                  name="comprovante_matricula_url"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
                <div className="mt-1 w-full bg-white border border-dashed rounded-lg px-4 py-3 cursor-pointer text-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all duration-200">
                  <div className="flex items-center justify-center space-x-2">
                    <FaUpload className="text-xl" />
                    <span className="text-sm font-medium">
                      {files.comprovante_matricula_url
                        ? files.comprovante_matricula_url.name
                        : "Clique para selecionar"}
                    </span>
                  </div>
                </div>
              </label>

              {/* Comprovante de Residência */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Comprovante de Residência:
                </span>
                <input
                  type="file"
                  id="comprovante_residencia_url"
                  name="comprovante_residencia_url"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
                <div className="mt-1 w-full bg-white border border-dashed rounded-lg px-4 py-3 cursor-pointer text-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all duration-200">
                  <div className="flex items-center justify-center space-x-2">
                    <FaUpload className="text-xl" />
                    <span className="text-sm font-medium">
                      {files.comprovante_residencia_url
                        ? files.comprovante_residencia_url.name
                        : "Clique para selecionar"}
                    </span>
                  </div>
                </div>
              </label>

              {/* Foto 3x4 */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Foto 3x4:
                </span>
                <input
                  type="file"
                  id="foto_url"
                  name="foto_url"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
                <div className="mt-1 w-full bg-white border border-dashed rounded-lg px-4 py-3 cursor-pointer text-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all duration-200">
                  <div className="flex items-center justify-center space-x-2">
                    <FaUpload className="text-xl" />
                    <span className="text-sm font-medium">
                      {files.foto_url
                        ? files.foto_url.name
                        : "Clique para selecionar"}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </fieldset>
          
          {/* Botão */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 mt-6"
            >
              {loading ? "Enviando..." : "Enviar Cadastro"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}