# SGTU — Gerenciador de Transporte Universitário

Projeto para extensão da faculdade: sistema completo para gerenciamento de transporte universitário.

Este repositório contém duas aplicações principais:
- backend: API em Node.js/Express com Supabase, geração de PDFs, integração com Telegram Bot e Swagger para documentação.
- frontend: SPA em React + Vite com a interface do usuário.

Índice
1. Visão geral
2. Estrutura do repositório
3. Requisitos
4. Variáveis de ambiente importantes
5. Como executar (desenvolvimento)
6. Como usar o bot Telegram (inclui auto-login)
7. Documentação da API (Swagger)
8. Testes rápidos / Smoke tests
9. Segurança e boas práticas

-------------------------------------------------------------------------------

1) Visão geral
----------------
O objetivo é gerir rotas, pontos, motoristas, presenças e carteirinhas de alunos.
Tem integração com Telegram (bot para alunos, motoristas e admins), geração de relatórios e exportação (PDF/Excel).

2) Estrutura do repositório
----------------------------
Raiz:
- backend/ — servidor Express (API, bot, integração com Supabase)
	- src/
		- bot/ — código do Telegram bot (aluno, motorista, admin, session)
		- modules/ — módulos organizados por funcionalidade (alunos, presencas, viagens, etc.)
		- config/ — configuração (supabase, swagger)
		- middleware/ — middlewares (auth, validate, rateLimit)
		- routes/ — registro das rotas da API
	- .env.example — exemplo de variáveis de ambiente

- frontend/ — aplicação React + Vite

3) Requisitos
--------------
- Node.js 18+ (recomendo 18 ou 20)
- npm ou yarn
- Uma instância Supabase (ou PostgreSQL compatível) com as tabelas do sistema

4) Variáveis de ambiente importantes
------------------------------------
Copie `backend/.env.example` para `backend/.env` e preencha com seus valores reais.
Principais variáveis (resumo):
- SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE — credenciais Supabase
- JWT_SECRET — segredo para assinar tokens JWT (muito importante)
- BOT_API_KEY — chave usada para autorizar emissão de tokens para o bot (veja /api/auth/bot-token)
- BOT_JWT_EXPIRES_IN — duração do token emitido para o bot (ex: `1h`)
- TELEGRAM_BOT_TOKEN — token do bot do Telegram
- API_URL / API_KEY — usado pelo bot ao chamar endpoints internos

Não comite `backend/.env` no repositório.

5) Como executar (desenvolvimento)
----------------------------------
Terminal 1 — backend

```bash
cd backend
cp .env.example .env
# preencha .env com seus valores
npm install
npm run dev
```

Observações:
- O backend já inicializa o bot (veja `src/app.js` que importa `./bot/bot.js`). Se o bot estiver em outro host, configure as variáveis adequadamente.

Terminal 2 — frontend

```bash
cd frontend
npm install
npm run dev
```

6) Como usar o bot Telegram
---------------------------
- Instruções básicas (usuário/aluno):
	- Abra o bot no Telegram.
	- Para login manual: `/login email senha` — esse fluxo retorna um token (via header `X-Bot-Client: true`) e popula `session.token`.
	- Auto-login: se o `telegram_id` estiver salvo no banco (campo `alunos.telegram_id`), o bot faz um auto-login consultando a tabela e (agora) obtém um token curto via o serviço interno do backend; assim comandos como `/presenca` e `/validade` funcionam sem o `/login` manual.

- Token para testes e integração (rota dedicada):
	- `POST /api/auth/bot-token` — permite que o bot (ou um script autorizado) gere um token curto para um usuário baseado em `telegramId` ou `userId`.
	- A requisição deve conter header `X-Bot-Api-Key: <BOT_API_KEY>` e body JSON `{ "telegramId": 123456789 }`.

7) Documentação da API (Swagger)
--------------------------------
- O Swagger UI está disponível em: `http://localhost:4000/api-docs`
- O projeto usa `swagger-jsdoc` com comentários JSDoc nas rotas (`*.routes.js`).
- Você pode usar a seção Authorize do Swagger para colar um token JWT (Bearer) e testar endpoints protegidos.

8) Testes rápidos / Smoke tests
-------------------------------
- Testar rota de status:
	- GET `http://localhost:4000/api/status` => deve retornar 200
- Testar login via API (curl):
	- POST `http://localhost:4000/api/auth/login` { email, senha }
- Testar emissão de token para bot:
	- POST `http://localhost:4000/api/auth/bot-token` com header `X-Bot-Api-Key` e body `{ "telegramId": ... }`

9) Segurança e boas práticas
----------------------------
- Mantenha `JWT_SECRET` e `BOT_API_KEY` fora do repositório (use secret manager em produção).
- Tokens emitidos para o bot devem ser curtos (p.ex. 15m–1h).
- Se for expor o bot em ambiente não confiável, considere rotacionar `BOT_API_KEY` e aplicar IP allow-listing.
