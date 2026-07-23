# SGTU — Gerenciador de Transporte Universitário

Sistema completo para gestão de transporte universitário.  
**Frontend:** React 19 + Vite 7 + Tailwind CSS  
**Backend:** Node.js + Express 5 + Prisma ORM + PostgreSQL  
**Bot:** Telegram (Telegraf)

---

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação e execução](#instalação-e-execução)
   - [Backend manual](#1-backend)
   - [Docker (backend completo)](#docker)
   - [Frontend](#2-frontend)
3. [Estrutura completa](#estrutura-completa-do-projeto)
   - [Backend modules](#backend-srcmodules)
   - [Bot Telegram](#backend-srcbot)
   - [Frontend pages](#frontend-srcpages)
4. [Rotas da aplicação](#rotas-da-aplicação)
5. [Testes](#testes)
   - [Frontend (33 testes)](#frontend-33-testes-8-arquivos)
   - [Backend (100+ testes)](#backend)
6. [API endpoints](#api-endpoints)
7. [Variáveis de ambiente](#variáveis-de-ambiente)
8. [Documentação adicional](#documentação-adicional)

---

## Pré-requisitos

- Node.js 18+
- npm
- PostgreSQL (via Supabase, Docker ou local)
- (Opcional) Conta no Telegram e token de bot

---

## Instalação e execução

### 1. Backend

```bash
cd backend

cp .env.example .env
# Preencha .env com suas credenciais

npm install
npm run dev
```

Servidor em `http://localhost:4000` — Swagger em `http://localhost:4000/api-docs`.

### Docker

Alternativa com PostgreSQL já incluso:

```bash
cd backend
docker compose up -d
```

Sobe o banco PostgreSQL (porta 5432) e a aplicação (porta 4000).  
O `docker-compose.yml` usa a imagem `postgres:16-alpine` com health check.

### 2. Frontend

```bash
cd frontend

cp .env.example .env
# Edite VITE_API_URL se necessário

npm install
npm run dev
```

Frontend em `http://localhost:5173`.

---

## Estrutura completa do projeto

```
sgtu-projeto/
├── backend/
│   ├── src/
│   │   ├── app.js                # Express app (middlewares, rotas, bot, swagger)
│   │   ├── server.js             # Entrypoint do servidor
│   │   ├── bot/                  # Telegram Bot
│   │   │   ├── bot.js            # Inicialização do bot Telegraf
│   │   │   ├── aluno.js          # Comando /presenca, /validade
│   │   │   ├── admin.js          # Comandos administrativos
│   │   │   ├── motorista.js      # Comandos para motoristas
│   │   │   ├── session.js        # Gerenciamento de sessão
│   │   │   ├── apiClient.js      # Cliente HTTP para API interna
│   │   │   ├── cron.js           # Tarefas agendadas
│   │   │   ├── notifications.js  # Notificações push
│   │   │   └── safeSend.js       # Utilitário de envio seguro
│   │   ├── modules/              # 20 módulos funcionais (detalhados abaixo)
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT authentication
│   │   │   ├── validate.js       # Validação com Zod
│   │   │   └── rateLimit.js      # Rate limiting
│   │   ├── routes/               # Agrupamento de rotas
│   │   ├── config/
│   │   │   ├── supabase.js       # Cliente Supabase
│   │   │   └── swagger.js        # Configuração Swagger
│   │   ├── shared/               # Helpers e utils
│   │   └── generated/            # Código gerado
│   ├── tests/                    # Testes de integração e unitários
│   │   ├── integration/          # 21 arquivos de teste
│   │   ├── unit/                 # Testes unitários
│   │   └── helpers/              # Factories e utilities
│   ├── prisma/
│   │   ├── schema.prisma         # Modelo do banco
│   │   ├── migrations/           # Migrations
│   │   ├── seed.js               # Dados iniciais
│   │   └── exportar.mjs          # Script de exportação
│   ├── docker-compose.yml        # PostgreSQL + app
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # Entry point (providers)
│   │   ├── App.jsx               # Rotas da aplicação
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Cadastro (3 etapas)
│   │   │   ├── Admin/             # 10 subpáginas admin
│   │   │   └── Aluno/             # Dashboard e reenvio docs
│   │   ├── components/            # UI, layout, ErrorBoundary, etc.
│   │   ├── contexts/              # AuthContext, ToastContext
│   │   ├── hooks/                 # useAuth, useToast, useSortableData
│   │   ├── routes/                # ProtectedRoute
│   │   ├── layouts/               # PublicLayout, AdminLayout, AuthLayout
│   │   ├── services/              # api.ts (axios + interceptors + refresh)
│   │   ├── schemas/               # Validação Zod
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Utilitários
│   ├── tailwind.config.js
│   ├── vitest.config.js
│   └── package.json
│
├── notas/                         # Documentação do projeto
│   ├── api.md                     # Endpoints da API
│   ├── arquitetura.md             # Decisões arquiteturais
│   ├── banco-de-dados.md          # Modelagem do banco
│   ├── como-rodar.md              # Guia rápido
│   ├── funcionalidades.md         # Lista de funcionalidades
│   └── pendencias.md              # Itens pendentes
│
└── README.md                      # Documentação original
```

### Backend `src/modules/`

Cada módulo segue o padrão: `*.routes.js`, `*.controller.js`, `*.service.js`, `*.schema.js`.

| Módulo | Descrição |
|---|---|
| `auth/` | Login, refresh, logout, bot-token |
| `alunos/` | CRUD alunos, perfil, estatísticas |
| `signup/` | Solicitação de cadastro, aprovação/reprovação |
| `motoristas/` | CRUD motoristas |
| `rotas/` | CRUD rotas |
| `pontos/` | CRUD pontos de embarque |
| `rotaPontos/` | Associação rota ↔ ponto |
| `rotaMotoristas/` | Associação rota ↔ motorista |
| `rotaFaculdades/` | Associação rota ↔ faculdade |
| `faculdades/` | CRUD faculdades |
| `cursos/` | CRUD cursos |
| `viagens/` | Viagens diárias, status, resumo |
| `presencas/` | Marcação de presença, confirmação |
| `alunoPontos/` | Vinculação aluno ↔ ponto |
| `carteirinhas/` | Geração de carteirinhas (PDF) |
| `configuracoes/` | Configurações do sistema |
| `escalas/` | Escalas de motoristas |
| `relatorios/` | Relatórios e exportação |
| `usuarios/` | Perfil, senha, integração Telegram |
| `health/` | Health check |

### Frontend `src/pages/`

| Rota | Página | Descrição |
|---|---|---|
| `/login` | `auth/Login.tsx` | Login com validação |
| `/cadastro` | `auth/Cadastro.jsx` | Cadastro em 3 etapas |
| `/` | `Home.jsx` | Página inicial |
| `/perfil` | `Perfil.jsx` | Perfil do usuário |
| `/aluno` | `Aluno/AlunoDashboard.jsx` | Dashboard do aluno |
| `/aluno/reenviar-documentos` | `Aluno/ReenvioDocumentos.jsx` | Reenvio de documentos |
| `/motorista/volta` | `MotoristaVolta.jsx` | Confirmação de volta |
| `/admin` | `Admin/dashboard/` | Dashboard admin |
| `/admin/alunos` | `Admin/alunos/` | Gestão de alunos |
| `/admin/rotas` | `Admin/rotas/` | Gestão de rotas |
| `/admin/faculdades` | `Admin/faculdades/` | Gestão de faculdades |
| `/admin/cursos` | `Admin/cursos/` | Gestão de cursos |
| `/admin/pontos` | `Admin/pontos/` | Gestão de pontos |
| `/admin/motoristas` | `Admin/motoristas/` | Gestão de motoristas |
| `/admin/escalas` | `Admin/escalas/` | Escalas de motoristas |
| `/admin/relatorios` | `Admin/relatorios/` | Relatórios |
| `/admin/requests/:id` | `Admin/requests/` | Detalhe solicitação |

---

## Rotas da aplicação

Estrutura de rotas definida em `frontend/src/App.jsx`:

```
/login              → AuthLayout > Login
/cadastro           → Cadastro
/                   → PublicLayout > Home
/perfil             → PublicLayout > ProtectedRoute > Perfil
/aluno              → PublicLayout > ProtectedRoute(aluno) > AlunoDashboard
/aluno/reenviar-documentos → idem
/motorista/volta    → PublicLayout > MotoristaVolta
/admin              → AdminLayout > AdminDashboard
/admin/*            → AdminLayout > (alunos, rotas, etc.)
```

O `ProtectedRoute` verifica autenticação e role (`admin` ou `aluno`), exibindo skeleton durante loading e redirecionando para `/login` ou `/` quando necessário.

---

## Testes

### Frontend (33 testes, 8 arquivos)

```bash
cd frontend
npx vitest run --pool=threads
```

| Arquivo | Testes | Cobertura |
|---|---|---|
| `Login.test.jsx` | 7 | Render, validação email, login admin/aluno, erro API, toggle senha, link cadastro |
| `Cadastro.test.jsx` | 6 | Render seções, campos, botão voltar, submit, carregar faculdades, toast erro |
| `AuthContext.test.jsx` | 5 | Init loading/user, cookie salvo, cookie inválido, login, logout |
| `ToastContext.test.jsx` | 7 | Render children, 4 tipos toast, auto-remoção 3s |
| `ProtectedRoute.test.tsx` | 4 | Loading skeleton, redirect não-auth, role mismatch, role ok |
| `ErrorBoundary.test.jsx` | 3 | Children ok, fallback erro, botão "Tentar novamente" |
| `useAuth.test.ts` | 1 | Erro ao usar fora de AuthProvider |
| `useToast.test.js` | 1 | Undefined ao usar fora de ToastProvider |

### Backend

```bash
cd backend
npm test
```

Testes de integração com banco PostgreSQL real + fixtures.  
~21 arquivos de integração + unitários cobrindo:

| Arquivo | Escopo |
|---|---|
| `auth.test.js` | Login, logout, refresh, role-based access |
| `alunos.test.js` | CRUD, paginação, estatísticas, perfil |
| `signup.test.js` | Solicitação, aprovação, reprovação |
| `cursos.test.js` | CRUD cursos |
| `faculdades.test.js` | CRUD faculdades |
| `motoristas.test.js` | CRUD motoristas |
| `rotas.test.js` | CRUD rotas |
| `pontos.test.js` | CRUD pontos |
| `viagens.test.js` | Viagens, filtros, bot auth |
| `presencas.test.js` | Marcação, confirmação, desativação |
| `alunoPontos.test.js` | Vincular/desvincular aluno-ponto |
| `usuario.test.js` | Perfil, senha, integração Telegram |
| `carteirinhas.test.js` | Geração de carteirinhas |
| `configuracoes.test.js` | Configs do sistema |
| `escalas.test.js` | Escalas de motoristas |
| `relatorios.test.js` | Relatórios |
| `associacoes.test.js` | Rota-motorista, rota-ponto, rota-faculdade |
| `upload.test.js` | Upload de documentos |
| `health.test.js` | Health check |
| `e2e.test.js` | Fluxo completo: cadastro → aprovação → login → perfil |
| `api.test.js` | Testes gerais da API |

---

## API endpoints

Principais rotas da API (`http://localhost:4000/api`):

| Rota | Métodos | Auth |
|---|---|---|
| `/auth/login` | POST | — |
| `/auth/logout` | POST | — |
| `/auth/refresh` | POST | — |
| `/auth/bot-token` | POST | Bot API Key |
| `/status` | GET | — |
| `/alunos` | GET | Admin |
| `/alunos/paginated` | GET | Admin |
| `/alunos/me` | GET | Bearer |
| `/alunos/:id` | GET/PUT | Admin |
| `/signup/request` | POST | — |
| `/signup` | GET | Admin |
| `/signup/:id/approve` | PUT | Admin |
| `/signup/:id/reprove` | PUT | Admin |
| `/cursos` | GET/POST | —/Admin |
| `/faculdades` | GET/POST | —/Admin |
| `/motoristas` | GET/POST | Admin |
| `/rotas` | GET/POST | Admin |
| `/pontos` | GET/POST | Admin |
| `/viagens` | GET | Admin |
| `/viagens/hoje/alunos` | GET | Bot API Key |
| `/viagens/hoje/resumo` | GET | Bot API Key |
| `/presencas/marcar-presenca` | POST | Bearer |
| `/presencas/confirmar-embarque` | POST | Token temporário |
| `/presencas/confirmar-volta` | POST | Token temporário |
| `/presencas/rota/:rotaId` | GET | Admin |
| `/presencas/aluno/:alunoId` | GET | Admin |
| `/carteirinhas/gerar/:alunoId` | POST | Admin |
| `/usuario/me` | GET/PUT | Bearer |
| `/usuario/me/senha` | PATCH | Bearer |
| `/usuario/me/telegram/*` | POST/GET | Bearer |
| `/escalas/:ano` | GET | Admin |
| `/escalas/automatica` | POST | Admin |
| `/configuracoes` | GET | Admin |
| `/aluno-pontos/vincular` | POST | Bearer |
| `/relatorios/geral` | GET | Admin |
| `/upload/:alunoId` | POST | Bearer |

Documentação Swagger completa em `/api-docs`.

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | Sim | Porta do servidor (4000) |
| `DATABASE_URL` | Sim | URL de conexão PostgreSQL |
| `JWT_SECRET` | Sim | Chave secreta para assinar JWT |
| `SUPABASE_URL` | Não | URL do Supabase (storage) |
| `SUPABASE_ANON_KEY` | Não | Chave anônima Supabase |
| `SUPABASE_SERVICE_ROLE` | Não | Chave de serviço Supabase |
| `TELEGRAM_BOT_TOKEN` | Não | Token do bot Telegram |
| `TELEGRAM_BOT_USERNAME` | Não | Username do bot |
| `BOT_API_KEY` | Não | Chave para emissão de tokens via bot |
| `BOT_JWT_EXPIRES_IN` | Não | Duração do token do bot (ex: 1h) |
| `MOTORISTAS_GROUP_ID` | Não | ID do grupo de motoristas no Telegram |
| `API_URL` | Sim | URL base da API para o bot |
| `API_KEY` | Não | Chave da API para o bot |
| `FRONTEND_URL` | Sim | URL do frontend (CORS) |
| `STORAGE_BUCKET` | Não | Nome do bucket de arquivos |
| `WEB_VIEW_TOKEN` | Não | Token para web view |
| `QR_CODE_IDA_INICIO` | Não | Horário início QR code ida |
| `QR_CODE_IDA_FIM` | Não | Horário fim QR code ida |
| `QR_CODE_VOLTA_INICIO` | Não | Horário início QR code volta |
| `QR_CODE_VOLTA_FIM` | Não | Horário fim QR code volta |
| `TZ` | Não | Fuso horário (America/Sao_Paulo) |
| `NODE_ENV` | Não | Ambiente (development/test/production) |

### Frontend (`frontend/.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | Sim | URL base da API (ex: http://localhost:4000/api) |

---

## Stack

### Frontend

React 19, Vite 7, Tailwind CSS 3, React Router 7, Chakra UI 3,  
Axios, Zod 4, react-hook-form, react-datepicker, recharts,  
Lucide React, next-themes, class-variance-authority,  
Vitest 4 + Testing Library + jest-dom

### Backend

Node.js, Express 5, Prisma ORM 7, PostgreSQL (pg),  
JWT (jsonwebtoken + bcryptjs), Telegraf 4,  
Supabase JS, Swagger (swagger-jsdoc + swagger-ui-express),  
Zod 4, Multer, PDFKit, ExcelJS, QRCode,  
Helmet, CORS, express-rate-limit, cookie-parser,  
Pino (logging), node-cron, Vitest 4 + Supertest

---

## Funcionalidades principais

- **Autenticação** — JWT com access/refresh token, interceptors com fila de renovação
- **Cadastro de alunos** — 3 etapas (dados pessoais, acadêmicos, documentos)
- **Painel admin** — CRUD completo de alunos, rotas, motoristas, faculdades, cursos, pontos
- **Painel aluno** — Presenças, carteirinha digital, reenvio de documentos
- **Presenças** — Marcação via QR Code com confirmação de embarque/volta
- **Carteirinhas** — Geração de PDF com QR Code
- **Escalas** — Geração automática de escalas de motoristas
- **Relatórios** — Exportação de dados e relatórios gerenciais
- **Telegram Bot** — Consulta de presenças, validade, notificações (aluno, motorista, admin)
- **Upload** — Envio de documentos com multipart/form-data
- **Segurança** — Rate limiting, Helmet, validação com Zod, CORS configurável

---

## Documentação adicional

A pasta `notas/` contém documentação detalhada do projeto:

| Arquivo | Conteúdo |
|---|---|
| `api.md` | Lista completa de endpoints |
| `arquitetura.md` | Decisões e padrões arquiteturais |
| `banco-de-dados.md` | Modelagem e relacionamentos |
| `como-rodar.md` | Guia rápido de execução |
| `funcionalidades.md` | Descrição detalhada das funcionalidades |
| `pendencias.md` | Itens pendentes e melhorias futuras |
