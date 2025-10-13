import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import api from "../services/api.js";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { useToast } from "../hooks/useToast.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    document.title = "Login - SGTU";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email,
        senha,
      });

      login(res.data.user, res.data.token);

      if (res.data.user.tipo === "admin") {
        navigate("/admin");
      } else {
        navigate("/aluno");
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Falha no login. Verifique suas credenciais.";
      showToast(msg, "error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-xl w-96 max-w-sm"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Entrar
        </h2>
        
        {/* Input de Email com Ícone */}
        <div className="mb-4 relative">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          />
          <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Input de Senha com Ícones */}
        <div className="mb-6 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-10"
            required
          />
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Botão de Login com Ícone */}
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
        >
          <FaSignInAlt />
          <span>Entrar</span>
        </button>
      </form>
    </div>
  );
}