# TODO List Distribuído

Sistema de TODO List distribuído em 3 serviços + frontend, com autenticação e
autorização por usuário. Arquitetura e design (back-end e front-end) seguem o
mesmo padrão do projeto pessoal `auth-system` do autor.

## Arquitetura

```
frontend (React + Vite)                         :5173
   │ Bearer <jwt>
   ├──► Serviço 1 - service-tasks   (Node + Express + TypeScript + Prisma)  :3000
   │        │   auth (registro/login/me), CRUD de tarefas, dono por usuário
   │        └──► Serviço 2 (chamado internamente, repassando o token)
   │
   ├──► Serviço 2 - service-logs    (Laravel + Eloquent)                   :8000
   │        grava/consulta logs do usuário autenticado
   │
   └──► Serviço 3 - service-stats   (FastAPI + SQLAlchemy)                 :8001
            │   calcula total/concluídas/pendentes
            └──► Serviço 1 (GET /api/tasks, token repassado)
```

- **Serviço 1 (tasks-api)**: Node.js + Express 5 + TypeScript + **Prisma**
  (SQLite). Mesma arquitetura do `auth-system`: `AppError`, middlewares
  (`requireAuth`, `rateLimit`, `validateBody` com Zod, `noStore`),
  controller/service/model separados, `jwt.ts`/`password.ts`, envelope de
  resposta `{ success, message, data }` / `{ success:false, error }`. IDs de
  usuário e tarefa são UUID (igual ao original, só sem Postgres/citext, aqui
  é SQLite).
- **Serviço 2 (logs-api)**: Laravel + **Eloquent** (SQLite). Middleware
  `JwtAuth` valida o mesmo JWT HS256 emitido pelo serviço 1 (sem
  Passport/Sanctum, o emissor é externo). Respostas no mesmo envelope
  `{success, message, data}` / `{success:false, error}`.
- **Serviço 3 (stats-api)**: Python/FastAPI + **SQLAlchemy** (SQLite). Valida
  o JWT, busca as tarefas do usuário autenticado no serviço 1 (repassando o
  token), calcula total/concluídas/pendentes, grava um snapshot via ORM e
  responde no mesmo envelope dos outros dois serviços.
- **Autenticação**: JWT HS256 assinado pelo serviço 1 (`issuer: tasks.service`,
  `sub` = UUID do usuário) com segredo compartilhado (`JWT_SECRET`, igual nos
  três `.env`). Serviços 2 e 3 validam o token localmente, sem round-trip
  síncrono de autenticação.
- **Frontend**: React + Vite + TypeScript, clone visual exato do
  `auth-system` (mesmo `styles.css`, fontes Manrope, imagem de fundo,
  componentes `Stage`/`Badge`/`Field`, animação de texto no título). A tela
  pós-login mostra a lista de tarefas + estatísticas no lugar do dashboard de
  exemplo do projeto original.

## Subindo os 3 serviços

### 1) Serviço de Tarefas (Node + TS + Prisma), porta 3000

```bash
cd service-tasks
npm install
npx prisma migrate dev --name init
npm run dev
```

### 2) Serviço de Logs (Laravel + Eloquent), porta 8000

```bash
cd service-logs
composer install
php artisan migrate
php artisan serve --port=8000
```

### 3) Serviço de Estatísticas (FastAPI + SQLAlchemy), porta 8001

```bash
cd service-stats
python -m venv .venv
./.venv/Scripts/python -m pip install -r requirements.txt
./.venv/Scripts/python -m uvicorn app.main:app --port 8001
```

### 4) Frontend (React + Vite), porta 5173

```bash
cd frontend/frontend
npm install
npm run dev
```

Abrir http://localhost:5173

## Variáveis de ambiente

O que importa manter igual nos 3 serviços é `JWT_SECRET`:

- `service-tasks/.env`: `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`,
  `LOGS_SERVICE_URL`
- `service-logs/.env`: `JWT_SECRET` (exposto em `config/app.php` como
  `jwt_secret`)
- `service-stats/.env`: `JWT_SECRET`, `TASKS_SERVICE_URL`

## Fluxo de autenticação

1. `POST /api/auth/register` ou `/api/auth/login` no serviço 1 retorna
   `{ success, message, data: { user, accessToken, tokenType } }`.
2. Frontend guarda o token no `localStorage` e manda `Authorization: Bearer
   <token>` em toda chamada aos 3 serviços.
3. Cada serviço decodifica o JWT e extrai `sub` (UUID do usuário). Tarefas,
   logs e stats são sempre filtrados por esse id. Tentativa de alterar/excluir
   tarefa de outro usuário resulta em `403 FORBIDDEN` + log `ACESSO_NEGADO`.

## Endpoints

**Serviço 1** (`http://localhost:3000/api`)
- `POST /auth/register` `{ nome, email, senha, confirmarSenha? }`
- `POST /auth/login` `{ email, senha }`
- `GET /auth/me` (auth)
- `POST /auth/logout` (auth)
- `GET /tasks` (auth)
- `POST /tasks` `{ titulo, descricao? }` (auth)
- `PUT /tasks/:taskId` `{ titulo?, descricao?, concluida? }` (auth, só dono)
- `DELETE /tasks/:taskId` (auth, só dono)

**Serviço 2** (`http://localhost:8000/api`)
- `POST /logs` `{ acao, detalhe }` (auth), usado internamente pelo serviço 1
- `GET /logs` (auth), logs do usuário autenticado

**Serviço 3** (`http://localhost:8001/api`)
- `GET /stats` (auth) retorna `{ success, message, data: { usuarioId, total, concluidas, pendentes } }`

## O que foi validado

- Regressão completa via HTTP direto: registro, login, criar/listar/concluir/
  excluir tarefa, stats corretas por usuário, usuário B tentando mexer em
  tarefa do usuário A resultando em `403 FORBIDDEN` + log `ACESSO_NEGADO`
  atribuído ao usuário correto, requisição sem token retornando `401` no
  envelope de erro padrão.
- `tsc --noEmit` limpo nos dois projetos TypeScript (`service-tasks` e
  `frontend/frontend`).
- Frontend renderizado via Chrome headless (screenshot), layout, fontes e
  imagem de fundo idênticos ao `auth-system`.
- Teste de interação completa (clicar, preencher formulário, logar e ver a
  lista de tarefas) não foi feito num navegador real neste ambiente, sem
  Playwright/chromium-cli disponíveis para automação. Recomenda-se abrir
  http://localhost:5173 manualmente para o teste final do fluxo de login,
  criar/concluir/excluir tarefa.
