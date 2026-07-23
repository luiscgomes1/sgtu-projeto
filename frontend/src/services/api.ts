import axios, { AxiosError } from "axios"
import type {
  ApiResponse,
  PaginatedResponse,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  SignupPayload,
  PaginatedQuery,
} from "../types"
import type {
  Aluno,
  AlunoPerfil,
  Motorista,
  Faculdade,
  Curso,
  Rota,
  Ponto,
  Presenca,
  Viagem,
  Configuracao,
} from "../types"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

let accessToken: string | null = null
let refreshToken: string | null = null
let onLogout: (() => void) | null = null

export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
}

export function setOnLogout(fn: () => void) {
  onLogout = fn
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error)
    else if (token) p.resolve(token)
  })
  pendingQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as { _retry?: boolean } & typeof error.config
    if (!originalRequest) return Promise.reject(error)

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post<ApiResponse<RefreshResponse>>(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        )
        const newAccess = data.data!.accessToken
        const newRefresh = data.data!.refreshToken
        setTokens(newAccess, newRefresh)
        processQueue(null, newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch {
        processQueue(error, null)
        clearTokens()
        onLogout?.()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

function extractData<T>(response: { data: ApiResponse<T> | T & { error?: string } }): T {
  const body = response.data as ApiResponse<T>
  if (body.error) throw new Error(body.error)
  return (body.data ?? body) as T
}

export const apiService = {
  // Auth
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>("/auth/login", payload).then(extractData),

  refresh: (token: string) =>
    api.post<ApiResponse<RefreshResponse>>("/auth/refresh", { refreshToken: token }),

  logout: () =>
    api.post("/auth/logout", { refreshToken }).then(() => clearTokens()),

  // Alunos
  getAlunos: () =>
    api.get<ApiResponse<Aluno[]>>("/alunos").then(extractData),

  getAlunosPaginated: (params: PaginatedQuery & {
    status_cadastro?: string
    faculdade_id?: string
    curso_id?: string
    search?: string
    limit?: number
    offset?: number
  }) =>
    api.get<ApiResponse<Aluno[]> & { total: number }>("/alunos/paginated", { params }).then((r) => r.data),

  getAluno: (id: string) =>
    api.get<ApiResponse<Aluno>>(`/alunos/${id}`).then(extractData),

  getMe: () =>
    api.get<ApiResponse<AlunoPerfil>>("/alunos/me").then(extractData),

  getEstatisticas: (params?: { status_cadastro?: string }) =>
    api.get<ApiResponse<{ porCurso: { curso_id: string; nome: string; total: number }[]; porFaculdade: { faculdade_id: string; nome: string; total: number }[] }>>("/alunos/estatisticas", { params }).then(extractData),

  updateAluno: (id: string, dados: Partial<Aluno> & { nome?: string }) =>
    api.put<ApiResponse<Aluno>>(`/alunos/${id}`, dados).then(extractData),

  inativarAluno: (id: string) =>
    api.patch<ApiResponse<Aluno>>(`/alunos/${id}`).then(extractData),

  reenviarDocumentos: (usuarioId: string, payload: SignupPayload) =>
    api.post(`/alunos/${usuarioId}/reenviar-documentos`, payload),

  // Motoristas
  getMotoristas: () =>
    api.get<ApiResponse<Motorista[]>>("/motoristas").then(extractData),

  getMotoristasPaginated: (params: PaginatedQuery) =>
    api.get<PaginatedResponse<Motorista>>("/motoristas/paginated", { params }).then((r) => r.data),

  getMotorista: (id: string) =>
    api.get<ApiResponse<Motorista>>(`/motoristas/${id}`).then(extractData),

  createMotorista: (data: Partial<Motorista>) =>
    api.post<ApiResponse<Motorista>>("/motoristas", data).then(extractData),

  updateMotorista: (id: string, data: Partial<Motorista>) =>
    api.put<ApiResponse<Motorista>>(`/motoristas/${id}`, data).then(extractData),

  setMotoristaStatus: (id: string, status: string) =>
    api.patch(`/motoristas/${id}/status`, { status }),

  // Faculdades
  getFaculdades: () =>
    api.get<ApiResponse<Faculdade[]>>("/faculdades").then(extractData),

  getFaculdadesPaginated: (params: PaginatedQuery) =>
    api.get<PaginatedResponse<Faculdade>>("/faculdades/paginated", { params }).then((r) => r.data),

  getFaculdade: (id: string) =>
    api.get<ApiResponse<Faculdade>>(`/faculdades/${id}`).then(extractData),

  createFaculdade: (data: { nome: string }) =>
    api.post<ApiResponse<Faculdade>>("/faculdades", data).then(extractData),

  updateFaculdade: (id: string, data: { nome: string }) =>
    api.put<ApiResponse<Faculdade>>(`/faculdades/${id}`, data).then(extractData),

  setFaculdadeStatus: (id: string, status: string) =>
    api.patch(`/faculdades/${id}`, { status }),

  // Cursos
  getCursos: () =>
    api.get<ApiResponse<Curso[]>>("/cursos").then(extractData),

  getCursosPaginated: (params: PaginatedQuery) =>
    api.get<PaginatedResponse<Curso>>("/cursos/paginated", { params }).then((r) => r.data),

  getCursosByFaculdade: (faculdadeId: string) =>
    api.get<ApiResponse<Curso[]>>(`/cursos/${faculdadeId}`).then(extractData),

  getCurso: (id: string) =>
    api.get<ApiResponse<Curso>>(`/cursos/${id}`).then(extractData),

  createCurso: (data: { nome: string; faculdadeId: string }) =>
    api.post<ApiResponse<Curso>>("/cursos", data).then(extractData),

  updateCurso: (id: string, data: { nome: string; faculdadeId?: string }) =>
    api.put<ApiResponse<Curso>>(`/cursos/${id}`, data).then(extractData),

  setCursoStatus: (id: string, status: string) =>
    api.patch(`/cursos/${id}`, { status }),

  // Rotas
  getRotas: () =>
    api.get<ApiResponse<Rota[]>>("/rotas").then(extractData),

  getRotasPaginated: (params: PaginatedQuery) =>
    api.get<PaginatedResponse<Rota>>("/rotas/paginated", { params }).then((r) => r.data),

  getRota: (id: string) =>
    api.get<ApiResponse<Rota>>(`/rotas/${id}`).then(extractData),

  createRota: (data: { nome: string }) =>
    api.post<ApiResponse<Rota>>("/rotas", data).then(extractData),

  updateRota: (id: string, data: { nome: string }) =>
    api.put<ApiResponse<Rota>>(`/rotas/${id}`, data).then(extractData),

  setRotaStatus: (id: string, status: string) =>
    api.patch(`/rotas/${id}/status`, { status }),

  // Pontos
  getPontos: () =>
    api.get<ApiResponse<Ponto[]>>("/pontos").then(extractData),

  getPontosPaginated: (params: PaginatedQuery) =>
    api.get<PaginatedResponse<Ponto>>("/pontos/paginated", { params }).then((r) => r.data),

  getPonto: (id: string) =>
    api.get<ApiResponse<Ponto>>(`/pontos/detalhe/${id}`).then(extractData),

  createPonto: (data: { nome: string; endereco?: string }) =>
    api.post<ApiResponse<Ponto>>("/pontos", data).then(extractData),

  updatePonto: (id: string, data: { nome?: string; endereco?: string }) =>
    api.put<ApiResponse<Ponto>>(`/pontos/${id}`, data).then(extractData),

  setPontoStatus: (id: string, status: string) =>
    api.patch(`/pontos/${id}/status`, { status }),

  // Signup / Requests
  getRequestsPaginated: (params: { status?: string; limit?: number; offset?: number }) =>
    api.get<{ data: Aluno[]; total: number }>("/signup/paginated", { params }).then((r) => r.data),

  getRequests: () =>
    api.get<ApiResponse<Aluno[]>>("/signup").then(extractData),

  getPendingRequests: () =>
    api.get<ApiResponse<Aluno[]>>("/signup/pending").then(extractData),

  getRequest: (id: string) =>
    api.get<ApiResponse<Aluno>>(`/signup/${id}`).then(extractData),

  approveRequest: (id: string) =>
    api.put(`/signup/${id}/approve`),

  reproveRequest: (id: string) =>
    api.put(`/signup/${id}/reprove`),

  approveReenvio: (id: string) =>
    api.put(`/signup/${id}/approve-reenvio`),

  signup: (payload: SignupPayload) =>
    api.post("/signup/request", payload),

  // Carteirinhas
  gerarCarteirinha: (alunoId: string) =>
    api.post(`/carteirinhas/gerar/${alunoId}`),

  getCarteirinhas: (alunoId: string) =>
    api.get<ApiResponse<import("../types").Carteirinha[]>>(`/carteirinhas/${alunoId}`).then(extractData),

  getMinhaCarteirinha: (alunoId: string) =>
    api.get<ApiResponse<import("../types").Carteirinha>>(`/carteirinhas/minha-carteirinha/${alunoId}`).then(extractData),

  // Configuracoes
  getConfiguracoes: () =>
    api.get<ApiResponse<Configuracao>>("/configuracoes").then(extractData),

  updateLogo: (logoUrl: string) =>
    api.put("/configuracoes/logo", { logoUrl }),

  updateNomeOrganizacao: (nomeOrganizacao: string) =>
    api.put("/configuracoes/nome-organizacao", { nomeOrganizacao }),

  getHoraLimite: () =>
    api.get<{ horaLimitePresenca: string }>("/configuracoes/hora-limite").then((r) => r.data),

  updateHoraLimite: (horaLimitePresenca: string) =>
    api.put("/configuracoes/hora-limite", { horaLimitePresenca }),

  // Upload
  uploadFiles: (alunoId: string, files: File[]) => {
    const form = new FormData()
    files.forEach((f) => form.append("files", f))
    return api.post(`/upload/${alunoId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  // Usuario
  updatePerfil: (data: { nome?: string; email?: string }) =>
    api.put("/usuario/me", data),

  alterarSenha: (senhaAtual: string, novaSenha: string) =>
    api.patch("/usuario/me/senha", { senhaAtual, novaSenha }),

  // Presencas
  getPresencasPorRota: (rotaId: string, data?: string) =>
    api.get<ApiResponse<Presenca[]>>(`/presencas/rota/${rotaId}`, { params: { data } }).then(extractData),

  getPresencasPorAluno: (alunoId: string) =>
    api.get<ApiResponse<Presenca[]>>(`/presencas/aluno/${alunoId}`).then(extractData),

  // Viagens
  getViagens: (params?: { rotaId?: string; data?: string }) =>
    api.get<ApiResponse<Viagem[]>>("/viagens", { params }).then(extractData),

  getViagem: (id: string) =>
    api.get<ApiResponse<Viagem>>(`/viagens/${id}`).then(extractData),

  // Escalas
  gerarEscalaAutomatica: (ano: number, motoristasIds: string[]) =>
    api.post("/escalas/automatica", { ano, motoristasIds }),

  getEscalasAno: (ano: number) =>
    api.get(`/escalas/${ano}`).then((r) => r.data),

  getEscalaMensal: (ano: number, mes: number) =>
    api.get(`/escalas/${ano}/${mes}`).then((r) => r.data),

  desativarEscala: (ano: number, mes: number) =>
    api.patch(`/escalas/${ano}/${mes}/desativar`),

  // Relatorios
  getRelatorioGeral: () =>
    api.get("/relatorios/geral").then((r) => r.data),
}

export default api
