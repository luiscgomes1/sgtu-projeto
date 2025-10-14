import { useCallback, useEffect, useState } from "react";
import api from "../../services/api.js";
import { useToast } from "../../hooks/useToast.js";
import { GlobalLoader } from "../../components/GlobalLoader.jsx";
import AdminDetailModal from "../../components/AdminDetailModal.jsx";
import { FaUserGraduate, FaSearch, FaEye } from "react-icons/fa";
import { useSortableData } from "../../hooks/useSortableData.js";

export default function AdminAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("aprovado");
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [selectedAlunoDetail, setSelectedAlunoDetail] = useState(null);
  const [carteirinha, setCarteirinha] = useState(null);
  const [isProcessing] = useState(false);

  const { showToast } = useToast();

  const offset = (page - 1) * limit;

  const fetchAlunos = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        limit,
        offset,
      };
      if (statusFilter && statusFilter !== "todos") params.status_cadastro = statusFilter;
      if (debouncedSearch && debouncedSearch.trim() !== "") params.search = debouncedSearch.trim();

      const { data } = await api.get("/alunos/paginated", { params });
      setAlunos(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar alunos.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [limit, offset, statusFilter, debouncedSearch, showToast]);


  useEffect(() => {
    document.title = "Admin - Alunos";
    fetchAlunos();
  }, [fetchAlunos]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch, limit]);

  const { sortedItems } = useSortableData(alunos, {
    key: "usuarios.nome",
    direction: "ascending",
  });

  async function fetchCarteirinha(alunoId) {
    try {
      const { data } = await api.get(`/carteirinhas/minha-carteirinha/${alunoId}`);
      setCarteirinha(data || null);
    } catch {
      setCarteirinha(null);
    }
  }

  async function fetchAlunoDetail(aluno) {
    try {
      const id = aluno.usuario_id || aluno.id;
      const { data } = await api.get(`/alunos/${id}`);
      setSelectedAlunoDetail(data);
      const alunoId = data.usuario_id || data.id;
      if (alunoId) await fetchCarteirinha(alunoId);
    } catch {
      setSelectedAlunoDetail(aluno);
      setCarteirinha(null);
    }
  }

  const handleOpenModal = (a) => {
    setSelectedAluno(a);
    setSelectedAlunoDetail(null);
    setCarteirinha(null);
    fetchAlunoDetail(a);
  };

  const handleCloseModal = () => setSelectedAluno(null);

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  if (loading) return <GlobalLoader />;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-lg border">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-3 flex items-center gap-2">
        <FaUserGraduate className="text-blue-600" /> Gerenciar Alunos
      </h2>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-md px-2 py-1 gap-2">
            <FaSearch className="text-gray-500" />
            <input
              placeholder="Buscar por nome ou email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: "aprovado", label: "Ativos" },
            { key: "pendente", label: "Pendentes" },
            { key: "reprovado", label: "Reprovados" },
            { key: "todos", label: "Todos" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                statusFilter === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-100 text-blue-800 text-sm uppercase">
              <th className="p-3 font-bold">Nome</th>
              <th className="p-3 font-bold">Email</th>
              <th className="p-3 font-bold">Telefone</th>
              <th className="p-3 font-bold">Faculdade</th>
              <th className="p-3 font-bold">Curso</th>
              <th className="p-3 font-bold">Status</th>
              <th className="p-3 font-bold text-right">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              sortedItems.map((a) => {
                const nome = a.usuarios?.nome || "-";
                const email = a.usuarios?.email || "-";
                const telefone = a.telefone || a.usuarios?.telefone || "-";
                const curso = a.cursos?.nome || "-";
                const faculdade = a.cursos?.faculdades?.nome || "-";
                const statusRaw = String(a.status_cadastro || "").toUpperCase();
                const statusMapRow = {
                  APROVADO: { label: "APROVADO", color: "bg-green-600 text-white" },
                  PENDENTE: { label: "PENDENTE", color: "bg-yellow-600 text-black" },
                  REPROVADO: { label: "REPROVADO", color: "bg-red-600 text-white" },
                };
                const sRow = statusMapRow[statusRaw] || { label: statusRaw || "N/A", color: "bg-gray-400 text-white" };

                return (
                  <tr key={a.usuario_id || a.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-medium text-gray-800">{nome}</td>
                    <td className="p-3 text-gray-700">{email}</td>
                    <td className="p-3 text-gray-700">{telefone}</td>
                    <td className="p-3 text-gray-700">{faculdade}</td>
                    <td className="p-3 text-gray-700">{curso}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sRow.color}`}>
                        {sRow.label}
                      </span>
                    </td>
                    <td className="p-3 flex justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(a)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-100 p-2 rounded-full transition flex items-center"
                        title="Ver detalhes"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Mostrando {Math.min(total, offset + 1)} - {Math.min(total, offset + limit)} de {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-100 rounded-md text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <div className="text-sm">{page} / {totalPages}</div>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-gray-100 rounded-md text-sm disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>

      {selectedAluno && (() => {
        const raw = selectedAlunoDetail || selectedAluno;
        const modalDetails = { ...raw, status: (raw.status || raw.usuarios?.status || "") };

        const statusCadastro = String(raw.status_cadastro || "").toUpperCase();
        const statusMap = {
          APROVADO: { label: "APROVADO", color: "bg-green-600" },
          PENDENTE: { label: "PENDENTE", color: "bg-yellow-600 text-black" },
          REPROVADO: { label: "REPROVADO", color: "bg-red-600" },
        };
        const sc = statusMap[statusCadastro] || { label: statusCadastro || "N/A", color: "bg-gray-400" };

        return (
          <AdminDetailModal
            title={<>Detalhes do Aluno</>}
            details={modalDetails}
            isProcessing={isProcessing}
            formData={modalDetails}
            editMode={false}
            setEditMode={() => {}}
            allowEdit={false}
            onClose={handleCloseModal}
            onSave={() => {}}
            onCancel={() => {}}
            onToggleStatus={() => showToast('info', 'Ação de ativar/desativar não implementada')}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <p className="text-gray-800 border-b border-gray-200 py-1">{raw.usuarios?.nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-800 border-b border-gray-200 py-1">{raw.usuarios?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <p className="text-gray-800 border-b border-gray-200 py-1">{raw.telefone || raw.usuarios?.telefone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                <p className="text-gray-800 border-b border-gray-200 py-1">{raw.cursos?.nome || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculdade</label>
                <p className="text-gray-800 border-b border-gray-200 py-1">{raw.cursos?.faculdades?.nome || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="py-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${sc.color}`}>
                    {sc.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Documents and Carteirinha */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Documentos</h4>
              <ul className="space-y-3 p-3 border rounded-lg bg-gray-50">
                {raw.comprovante_residencia_url && (
                  <li className="flex justify-between items-center">
                    <span>Comprovante de Residência</span>
                    <a
                      href={raw.comprovante_residencia_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-blue-600 underline hover:text-blue-800 transition"
                    >
                      Visualizar
                    </a>
                  </li>
                )}
                {raw.comprovante_matricula_url && (
                  <li className="flex justify-between items-center">
                    <span>Comprovante de Matrícula</span>
                    <a
                      href={raw.comprovante_matricula_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-blue-600 underline hover:text-blue-800 transition"
                    >
                      Visualizar
                    </a>
                  </li>
                )}
                {raw.foto_url && (
                  <li className="flex justify-between items-center">
                    <span>Foto 3x4</span>
                    <a
                      href={raw.foto_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-blue-600 underline hover:text-blue-800 transition"
                    >
                      Visualizar
                    </a>
                  </li>
                )}

                {carteirinha && (
                  <li>
                    <a
                      href={carteirinha?.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
                    >
                      Ver Carteirinha
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </AdminDetailModal>
        );
      })()}
    </div>
  );
}
