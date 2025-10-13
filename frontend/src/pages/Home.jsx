import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    document.title = "SGTU - Sistema de Gestão de Transporte Universitário";
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      {/* Hero */}
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
        Bem-vindo ao <span className="text-blue-600">SGTU</span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-8">
        O Sistema de Gestão de Transporte Universitário que simplifica sua vida:
        presença online, carteirinhas geradas automaticamente com QR Code e
        melhor controle para os administradores.
      </p>

      {/* Call to Action */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Fazer Login
        </Link>
        <Link
          to="/cadastro"
          className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg shadow hover:bg-gray-200 transition"
        >
          Cadastrar-se
        </Link>
      </div>

      {/* Destaques */}
      <div className="grid sm:grid-cols-3 gap-6 mt-16 max-w-4xl">
        <div className="p-6 bg-white shadow rounded-lg">
          <h3 className="font-semibold text-lg text-blue-600">
            📋 Presenças Online
          </h3>
          <p className="text-gray-600 mt-2 text-sm">
            Marque presença de forma simples pelo site ou pelo bot do Telegram.
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg">
          <h3 className="font-semibold text-lg text-blue-600">
            🎟️ Carteirinhas com QR Code
          </h3>
          <p className="text-gray-600 mt-2 text-sm">
            Use QR Code para confirmar embarque.
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-lg">
          <h3 className="font-semibold text-lg text-blue-600">👨‍✈️ Motoristas</h3>
          <p className="text-gray-600 mt-2 text-sm">
            Recebem lista pronta de embarques e notificações automáticas.
          </p>
        </div>
      </div>
    </div>
  );
}
