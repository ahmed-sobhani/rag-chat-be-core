# 🗂️ Chat Storage Microservice (NestJS + RAG)

This project is a **production-ready backend microservice** for storing chat histories from a **RAG (Retrieval-Augmented Generation)** based chatbot system.

It manages **chat sessions** and **messages** (with optional retrieved context), and exposes a secure REST API with features like session management, message retrieval, favorites, and deletion.


---

## 🚀 Features

* **Session management**: create, rename, mark favorite, delete.
* **Message management**: store messages with sender + optional RAG context.
* **API key authentication** (via `x-api-key` header).
* **Rate limiting** (protect against abuse).
* **Centralized logging using Pino & global error handling**.
* **Environment-based configuration** via `.env`.
* **Docker + Docker Compose** setup for easy local run.
* Health check endpoints (`/`, `/health`).
* Swagger/OpenAPI docs at `/docs` and `/api`.
* PgAdmin (database UI) in Docker.
* CORS configuration.
* Pagination on message history.

---

## 🏗️ Tech Stack

* **NestJS** (Node.js framework)
* **PostgreSQL** (database)
* **TypeORM** (ORM with migrations)
* **Docker & Docker Compose** (local dev)
* **Swagger** (API docs)

---

## 📂 Project Structure

```
src/
  shared/            # guards, filters, interceptors, dto
  chat/   
    DTOs/            # All DTOs          
    sessions/        # session (controller, service)
    messages/        # message (controller, service)
  database/          # Entities
  app.module.ts
  main.ts
```

---

## ⚙️ Setup

### 1. Clone repo

```bash
git clone https://github.com/ahmed-sobhani/rag-chat-be-core.git
cd rag-chat-be-core
```

### 2. Configure environment

Copy `.env.example` → `.env` and adjust values:

```bash
cp .env.example .env
```

### Example `.env`

```ini
# App
PORT=3000
API_KEY=supersecret

# Database
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_NAME=rag_chat_app
DATABASE_SSL=false

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
PGADMIN_PORT=5050

# Rate limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# CORS
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:4200,http://localhost:3000

# LOGGING
LOG_LEVEL=debug
LOG_DIR=./logs
SERVICE_NAME=rag-chat-service

# Console colorized single-line (set to false to keep raw JSON):
PRETTY_LOGS=true

# Optional Loki:
LOKI_URL=http://localhost:3100
LOKI_BATCH_INTERVAL=5000
# LOKI_BASIC_AUTH=user:pass
LOKI_LABELS={"job":"rag-chat-service","env":"development","service":"rag-chat-service"}
```

### 3. Run with Docker

```bash
docker-compose up --build
```

Services:

* API → [http://localhost:3000](http://localhost:3000)
* Swagger Docs → [http://localhost:3000/api](http://localhost:3000/api)
* Read Only Docs → [http://localhost:3000/docs](http://localhost:3000/docs)
* Health Check → [http://localhost:3000/health](http://localhost:3000/health)
* PgAdmin → [http://localhost:5050](http://localhost:5050)

---

## 🛡️ Best Practices Implemented

* API key guard
* Rate limiting (`@nestjs/throttler`)
* Centralized error filter
* Logging interceptor (JSON logs for Docker/K8s)
* Config validation (`@nestjs/config` + Joi)
* Pagination support

---

## 📦 Docker Compose Services

* **api** → NestJS app
* **db** → PostgreSQL
* **pgadmin** → optional DB admin UI

---

## 🧪 Tests

**Stack:** Jest + ts-jest (unit tests only; no DB).

**Run:**

```bash
npm test
npm run test:watch
npm run test:cov  # text + HTML at coverage/lcov-report/index.html
```

**Coverage (focus on services):**

```ts
// jest.config.ts (key bits)
collectCoverageFrom: [
  'src/chat/**/*.ts',
  '!src/**/*.spec.ts',
  '!src/**/index.ts',
  '!src/**/*.module.ts',
  '!src/**/*.controller.ts',
  '!src/**/*.dto.ts',
  '!src/main.ts',
  '!src/shared/**',
];
coverageReporters: ['text', 'text-summary', 'lcov'];
coverageThreshold: { global: { statements: 80, branches: 70, functions: 80, lines: 80 } };
```

**Files:**

* `src/chat/sessions/sessions.service.spec.ts`
* `src/chat/messages/messages.service.spec.ts`
* `test/factories.ts` (makeSession/makeMessage)
* `test/test-utils.ts` (repo mocks, uuid mock, reset helpers)

**Mocking:**

* Mock TypeORM `Repository`
* Mock helpers: `paginateAndSort`, `sortDeconstruct`, `rangeDateFilter`
* Mock `uuid.v7`
* In messages tests, mock `SessionsService.findById`

**CI (GitHub Actions):**

* Run tests on Node 22, cache deps, upload `coverage/` artifact.
