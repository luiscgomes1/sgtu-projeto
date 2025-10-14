import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import AlunoDashboard from "./pages/Aluno/AlunoDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ReenvioDocumentos from "./pages/Aluno/ReenvioDocumentos";
import AdminRequestDetail from "./pages/Admin/AdminRequestDetail";
import AdminRotas from "./pages/Admin/AdminRotas";
import AdminFaculdades from "./pages/Admin/AdminFaculdades";
import AdminCursos from "./pages/Admin/AdminCursos";
import AdminPontos from"./pages/Admin/AdminPontos";
import AdminMotoristas from "./pages/Admin/AdminMotoristas";
import AdminEscalas from "./pages/Admin/AdminEscalas";
import AdminRelatorios from "./pages/Admin/AdminRelatorios";
import Perfil from "./pages/Perfil";
import MotoristaVolta from "./pages/MotoristaVolta";
import AdminAlunos from "./pages/Admin/AdminAlunos";
//import AcessoNegado from "./pages/AcessoNegado";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="perfil" element={<Perfil />} />
          
          <Route path="login" element={<Login />} />
          <Route path="cadastro" element={<Cadastro />} />
          <Route path="motorista/volta" element={<MotoristaVolta />} />

          <Route path="aluno" element={<AlunoDashboard />} />
          <Route path="aluno/reenviar-documentos" element={<ReenvioDocumentos />} />
          

          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/requests/:id" element={<AdminRequestDetail />} />
          <Route path="admin/rotas" element={<AdminRotas />} />
          <Route path="admin/faculdades" element={<AdminFaculdades />} />
          <Route path="admin/cursos" element={<AdminCursos />} />
          <Route path="admin/pontos" element={<AdminPontos />} />
          <Route path="admin/motoristas" element={<AdminMotoristas />} />
          <Route path="admin/escalas" element={<AdminEscalas />} />
          <Route path="admin/relatorios" element={<AdminRelatorios />} />
          <Route path="admin/alunos" element={<AdminAlunos />} />
          {/* <Route path="acesso-negado" element={<AcessoNegado />} /> */}

        </Route>
      </Routes>
    </BrowserRouter>
  );
}