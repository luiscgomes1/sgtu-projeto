import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { FaBusAlt, FaSignOutAlt, FaUserCircle, FaChartBar, FaRoute, FaBuilding, FaUsers, FaClipboardList, FaGraduationCap, FaUserGraduate, FaBars, FaTimes } from 'react-icons/fa';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/cadastro";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAdmin = user?.tipo === "admin";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar principal */}
      <nav className="bg-blue-700 text-white px-4 sm:px-8 py-4 shadow-xl flex justify-between items-center z-10">
        <Link
          to="/"
          className="font-extrabold text-xl tracking-wider flex items-center space-x-2 transition duration-200 hover:text-blue-200"
        >
          <FaBusAlt className="text-2xl" />
          <span>SGTU</span>
        </Link>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-blue-600 transition"
            aria-label="Abrir menu"
          >
            <FaBars className="text-xl" />
          </button>

          <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link
                to={`/perfil`}
                className="flex items-center space-x-1 py-1 px-3 rounded-lg transition duration-200 hover:bg-blue-600 hover:text-white"
              >
                <FaUserCircle className="text-lg" />
                <span className="font-medium">Perfil</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-500 py-1 px-3 rounded-lg font-medium transition duration-200 hover:bg-red-600 shadow-md"
              >
                <FaSignOutAlt />
                <span>Sair</span>
              </button>
            </>
          ) : (
            !isAuthPage && (
              <>
                <Link
                  to="/login"
                  className="font-medium transition duration-200 hover:underline hover:text-blue-200"
                >
                  Login
                </Link>
                <Link
                  to="/cadastro"
                  className="bg-white text-blue-700 py-1 px-3 rounded-lg font-semibold transition duration-200 hover:bg-gray-100"
                >
                  Cadastre-se
                </Link>
              </>
            )
            )}
          </div>
        </div>
      </nav>

  <div className="flex flex-1">
        {isAdmin && (
          <aside className="hidden md:block w-64 bg-gray-100 border-r border-gray-300 p-4 space-y-2">
            <p className="text-gray-500 uppercase text-xs font-semibold mb-2">Admin</p>
            <NavItem to="/admin" icon={<FaChartBar />} text="Dashboard" />
            <NavItem to="/admin/alunos" icon={<FaUserGraduate />} text="Alunos" />
            <NavItem to="/admin/rotas" icon={<FaRoute />} text="Rotas" />
            <NavItem to="/admin/faculdades" icon={<FaBuilding />} text="Faculdades" />
            <NavItem to="/admin/cursos" icon={<FaGraduationCap />} text="Cursos" />
            <NavItem to="/admin/pontos" icon={<FaBusAlt />} text="Pontos" />
            <NavItem to="/admin/motoristas" icon={<FaUsers />} text="Motoristas" />
            <NavItem to="/admin/escalas" icon={<FaClipboardList />} text="Escalas" />
            <NavItem to="/admin/relatorios" icon={<FaClipboardList />} text="Relatórios" />
          </aside>
        )}

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div className="relative w-64 bg-white h-full p-4 overflow-auto transform transition-transform duration-200 ease-out translate-x-0">
              <div className="flex items-center justify-between mb-4">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center space-x-2">
                  <FaBusAlt className="text-2xl text-blue-600" />
                  <span className="font-extrabold">SGTU</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2">
                {user ? (
                  <>
                    <Link to="/perfil" onClick={() => setMobileOpen(false)} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                      <FaUserCircle /> <span>Perfil</span>
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-red-600">
                      <FaSignOutAlt /> <span>Sair</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="block p-2 rounded hover:bg-gray-100">Login</Link>
                    <Link to="/cadastro" onClick={() => setMobileOpen(false)} className="block p-2 rounded hover:bg-gray-100">Cadastre-se</Link>
                  </>
                )}

                {isAdmin && (
                  <div className="mt-4">
                    <p className="text-xs uppercase text-gray-500 mb-2">Admin</p>
                    <NavItem to="/admin" icon={<FaChartBar />} text="Dashboard" onClick={() => setMobileOpen(false)} />
                    <NavItem to="/admin/alunos" icon={<FaUserGraduate />} text="Alunos" />
                    <NavItem to="/admin/rotas" icon={<FaRoute />} text="Rotas" />
                    <NavItem to="/admin/faculdades" icon={<FaBuilding />} text="Faculdades" />
                    <NavItem to="/admin/cursos" icon={<FaGraduationCap />} text="Cursos" />
                    <NavItem to="/admin/pontos" icon={<FaBusAlt />} text="Pontos" />
                    <NavItem to="/admin/motoristas" icon={<FaUsers />} text="Motoristas" />
                    <NavItem to="/admin/escalas" icon={<FaClipboardList />} text="Escalas" />
                    <NavItem to="/admin/relatorios" icon={<FaClipboardList />} text="Relatórios" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 container mx-auto px-6 py-8">
          <Outlet />
        </main>
      </div>

      <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          © {new Date().getFullYear()} SGTU. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, icon, text, onClick }) {
  const location = useLocation();
  let active = false;
  if (to === "/admin") {
    active = location.pathname === to;
  } else {
    active = location.pathname === to || location.pathname.startsWith(to + "/");
  }
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${active ? 'bg-blue-100' : 'hover:bg-blue-100'}`}
    >
      <span className={`text-blue-600 ${active ? 'opacity-100' : 'opacity-85'}`}>{icon}</span>
      <span className={`text-gray-800 ${active ? 'font-semibold' : ''}`}>{text}</span>
    </Link>
  );
}
