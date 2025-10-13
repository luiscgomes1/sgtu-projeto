import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { useToast } from "../hooks/useToast";
import { FaUserEdit, FaSave, FaLock, FaKey } from "react-icons/fa";
import { GlobalLoader } from "../components/GlobalLoader";

export default function Perfil() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("dados");

  // Campos de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [forcaSenha, setForcaSenha] = useState({ nivel: "vazia", cor: "gray", texto: "Vazia" });
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const isAluno = user?.tipo === "aluno";

  const camposAluno = [
    { key: "nome", label: "Nome completo" },
    { key: "rg", label: "RG" },
    { key: "cpf", label: "CPF" },
    { key: "telefone", label: "Telefone" },
    { key: "endereco", label: "Endereço" },
    { key: "data_nascimento", label: "Data de nascimento", type: "date" },
    { key: "tipo_sanguineo", label: "Tipo sanguíneo" },
  ];

  const camposAdmin = [{ key: "nome", label: "Nome completo" }];
  const campos = isAluno ? camposAluno : camposAdmin;

  // 🔹 Lógica de força da senha
  function avaliarForcaSenha(senha) {
    if (!senha) return { nivel: "vazia", cor: "gray", texto: "Vazia" };

    let nivel = 0;
    if (senha.length >= 6) nivel++;
    if (/[A-Z]/.test(senha)) nivel++;
    if (/[0-9]/.test(senha)) nivel++;
    if (/[^A-Za-z0-9]/.test(senha)) nivel++;

    if (nivel <= 1) return { nivel: "fraca", cor: "#e74c3c", texto: "Fraca" };
    if (nivel === 2) return { nivel: "media", cor: "#f39c12", texto: "Média" };
    return { nivel: "forte", cor: "#2ecc71", texto: "Forte" };
  }

  // 🔹 Carregar perfil
  useEffect(() => {
    async function fetchPerfil() {
      try {
        const endpoint = isAluno ? "/alunos/me" : "/usuario/me";
        const { data } = await api.get(endpoint);
        setPerfil(isAluno ? { ...data, ...data.usuarios } : data);
      } catch (error) {
        const msg = error.response?.data?.message || "Erro ao carregar perfil.";
        showToast(msg, "error");
      } finally {
        setLoading(false);
      }
    }
    fetchPerfil();
  }, [isAluno]);

  // Atualiza força da senha conforme o usuário digita
  useEffect(() => {
    setForcaSenha(avaliarForcaSenha(novaSenha));
  }, [novaSenha]);

  // 🔹 Salvar dados pessoais
  async function handleSalvar() {
    try {
      setSalvando(true);
      const endpoint = isAluno ? "/alunos/me" : "/usuario/me";
      if (isAluno) {
        const updatedPerfil = { nome: perfil.nome, rg: perfil.rg, cpf: perfil.cpf, telefone: perfil.telefone, endereco: perfil.endereco, data_nascimento: perfil.data_nascimento, tipo_sanguineo: perfil.tipo_sanguineo };
        await api.put(endpoint, updatedPerfil);
      } else {
        const updatedPerfil = { nome: perfil.nome };
        await api.put(endpoint, updatedPerfil);
      }
      showToast("Perfil atualizado com sucesso!", "success");
      setEditando(false);
    } catch {
      showToast("Erro ao atualizar perfil.", "error");
    } finally {
      setSalvando(false);
    }
  }

  // 🔹 Alterar senha
  async function handleAlterarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      showToast("Preencha todos os campos de senha.", "warning");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      showToast("As senhas novas não coincidem.", "error");
      return;
    }

    try {
      setSalvandoSenha(true);
      await api.put("/usuario/me/senha", { senhaAtual, novaSenha });
      showToast("Senha alterada com sucesso!", "success");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch {
      showToast("Erro ao alterar senha.", "error");
    } finally {
      setSalvandoSenha(false);
    }
  }

  if (loading) return <GlobalLoader />;
  if (!perfil) return <p>Perfil não encontrado.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg transition-all duration-300">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Meu Perfil</h1>

      {/* Abas */}
      <div className="flex border-b mb-8">
        <button
          className={`px-5 py-2 font-medium transition-all duration-200 ${
            abaAtiva === "dados"
              ? "border-b-4 border-blue-600 text-blue-700"
              : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setAbaAtiva("dados")}
        >
          Dados Pessoais
        </button>
        <button
          className={`px-5 py-2 font-medium transition-all duration-200 ${
            abaAtiva === "senha"
              ? "border-b-4 border-blue-600 text-blue-700"
              : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setAbaAtiva("senha")}
        >
          Alterar Senha
        </button>
      </div>

      {/* ----------------------------- ABA DADOS PESSOAIS ----------------------------- */}
      {abaAtiva === "dados" && (
        <div className="animate-fadeIn">
          <div className="flex justify-end mb-4">
            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                <FaUserEdit /> Editar Dados
              </button>
            ) : (
              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {salvando ? "Salvando..." : <><FaSave /> Salvar</>}
              </button>
            )}
          </div>

          <form className="space-y-5">
            {campos.map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                <input
                  type={type || "text"}
                  value={perfil[key] || ""}
                  disabled={!editando}
                  onChange={(e) => setPerfil({ ...perfil, [key]: e.target.value })}
                  className={`w-full p-2 border rounded-md transition-all ${
                    editando
                      ? "border-gray-300 focus:ring-2 focus:ring-blue-500"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                  }`}
                />
              </div>
            ))}
          </form>
        </div>
      )}

      {/* ----------------------------- ABA SENHA ----------------------------- */}
      {abaAtiva === "senha" && (
        <div className="animate-fadeIn">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-6">
            {/* Senha atual */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaKey /> Senha Atual
              </h3>
              <input
                type="password"
                placeholder="Digite sua senha atual"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <hr className="border-gray-300" />

            {/* Nova senha */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaLock /> Nova Senha
              </h3>

              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Digite a nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />

                {/* Barra de força */}
                {novaSenha && (
                  <div>
                    <div
                      className="h-2 rounded-md transition-all"
                      style={{
                        background: `linear-gradient(90deg, ${forcaSenha.cor} 0%, ${forcaSenha.cor} 100%)`,
                      }}
                    ></div>
                    <p
                      className="text-sm mt-1 font-medium"
                      style={{ color: forcaSenha.cor }}
                    >
                      Força: {forcaSenha.texto}
                    </p>
                  </div>
                )}

                <input
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAlterarSenha}
                disabled={salvandoSenha}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {salvandoSenha ? "Salvando..." : <><FaSave /> Atualizar Senha</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
