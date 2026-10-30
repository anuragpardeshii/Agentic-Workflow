# Buildfast

An AI website builder with a React + Tailwind frontend, an Express API, and MongoDB storage. The UI takes inspiration from Atlassian's open layouts, blue accents, and warm geometric illustrations.

## Run with Docker

Requires Docker Compose. Copy `.env.example` to `.env` and replace `JWT_SECRET` with a random secret of at least 32 characters (`openssl rand -hex 32`). An ignored `.env` with a generated secret may already exist from local setup.

```sh
docker compose --profile local-ai up --build -d
docker compose exec ollama ollama pull qwen2.5-coder:7b
```

Open http://localhost:5174. Development emails appear at http://localhost:8025. The API is at http://localhost:3001/health. Vite hot reloads frontend changes; Node watch restarts the API. MongoDB and model data persist in named volumes. Stop with `docker compose --profile local-ai down` (do not add `-v` unless you intend to delete data).

The model download is about 4.7 GB; inference also needs sufficient RAM and CPU/GPU resources. Generation times depend on your hardware. For hosted free inference, set `AI_PROVIDER=openrouter`, `AI_MODEL=openrouter/free`, and a server-side `OPENROUTER_API_KEY` in `.env`, then run `make dev-restart`. Hosted quotas apply. `AI_FREE_ONLY=true` is the default and blocks legacy Groq access because its account billing cannot be enforced here. OpenRouter requests are restricted to free models with zero price ceilings and no paid model fallback.

Run `make ai-models` to list current free models with JSON support. See the [free AI comparison and workflow review](docs/free-ai-and-workflow.md) for model choices, setup, remaining gaps, and free static hosting. No live model-quality comparison has been performed.

After dependency changes, rebuild images and refresh the dependency volumes with `docker compose run --rm frontend npm ci` and `docker compose run --rm --user root backend npm ci`, then restart the services. Do not remove the database volume.

## Bring your own API key

Open **AI settings** (`/settings/ai`) to connect OpenAI/GPT, Anthropic/Claude, xAI/Grok, Gemini, Groq, or OpenRouter. Users can select a model, save an encrypted key, check provider access, replace/remove it, and choose a default or a connection for each build/refinement. Personal API usage is billed to the user’s provider account; the shared server default retains its free-only policy. Ollama remains available without a key.

`make setup` now also provisions the dedicated encryption secret, preserving existing secrets. Run `make dev-restart` to load it and apply migrations. Keep that secret stable and backed up. See [personal API connections](docs/api-connections.md) for setup, billing behavior, supported protocols and security details.

## Native development

Use Node 22 or newer. Run `npm run install:all`. Copy `.env.example` to `backend/.env`, configure MongoDB, SMTP, and Ollama addresses, and use separate terminals:

```sh
npm run dev --prefix backend
npm run dev --prefix frontend
```

Vite proxies `/api` to localhost:3001 by default; set `API_PROXY_TARGET=http://localhost:3000` for a native API on port 3000. `frontend/.env.example` documents the optional separate API origin. No private key belongs in a `VITE_` environment variable.

## Checks

```sh
npm run check
```

This runs frontend ESLint, source-file regression tests, the production build, and API tests. GitHub Actions also validates Compose and builds the API and production UI images. The frontend production target serves static assets and proxies `/api` to a backend service through Nginx. Build it with `docker build --target production -t buildfast-ui frontend`. Deploy behind HTTPS with production secrets, a secured database, and real SMTP settings. `compose.yaml` is intended for local development.

## Project layout

See the [website builder workflow review and rebuild plan](docs/website-builder-roadmap.md) for current gaps, generated-site folder conventions, preview/build architecture, free-tool tradeoffs, and the delivery order.

The builder includes a source folder explorer, file creation/rename/deletion, responsive preview widths, and a console. Manual edits still save to the browser session. The preview is a quick React preview; export and build the Vite source to verify production behavior. The export page provides Cloudflare upload/Git instructions; it does not publish automatically.

- `frontend/src/pages`: route screens, including authentication and the builder.
- `frontend/src/components`: shared navigation, layout, auth provider, and Sandpack editor.
- `frontend/src/features/builder`: source explorer, preview controls, and canonical source/preview helpers.
- `frontend/src/lib`: shared project parsing/storage, auth context, and feature content.
- `frontend/src/services`: a single API client and endpoint helpers.
- `backend/routes`: HTTP contracts and request validation.
- `backend/services/ai`: separate generation orchestration, provider adapters, and generated-project validation.
- `backend/middleware`: authentication, validation, async error forwarding.
- `backend/models`: MongoDB documents.
- `backend/app.js`: testable Express application; `backend/index.js`: startup and shutdown.
- `backend/tests`: API access and validation regression tests.
- `docs/review.md`: review findings, integration choices, migration notes, and limits.

## API contracts

All errors use `{ "error": "message" }`. Generation endpoints accept an optional owned `connectionId` (null for server default, omitted for the user’s saved default), require `Authorization: Bearer <token>` and return `{ response }` with the saved project. Session tokens expire after eight hours by default; sign in again to renew them.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account: username, email, password |
| POST | `/api/auth/login` | Sign in: email, password |
| GET | `/api/auth/validate` | Validate session and return profile |
| POST | `/api/projects/generate` | Generate with prompt |
| POST | `/api/projects/update` | Generate full revision with prompt, previousContent |
| GET | `/api/responses?page=1` | Latest owned projects, 20 per page |
| GET | `/api/responses/:id` | Read owned project |
| POST | `/api/contact` | Send name, email, message to configured team inbox |
| GET | `/health` | Database readiness (200 or 503) |

`/api/groq/generate` and `/api/groq/update` remain authenticated aliases for older clients. The incomplete refresh-token endpoint has been removed.

## Make commands and versioned migrations

Run `make help` for all commands. `make setup` creates an ignored `.env` with a generated JWT secret only when the file is missing.

| Command | Action |
| --- | --- |
| `make dev-up` | Build/start the Docker stack and apply pending migrations before API startup |
| `make dev-down` | Stop the stack without deleting volumes |
| `make dev-logs` / `make dev-ps` | Follow logs / inspect service status |
| `make dev-restart` | Recreate API/UI containers and apply updated environment settings |
| `make dev-frontend` | Start native Vite on port 5175, falling forward if occupied |
| `make dev-backend` | Start native API using backend/.env |
| `make migrate` | Apply versioned migrations to Docker MongoDB |
| `make migrate-status` | Verify and display applied/pending versions |
| `make migrate-create NAME=add_tags` | Create a timestamped migration scaffold |
| `make migrate-local` | Apply migrations using backend/.env |
| `make check` | Run lint, production build, and tests |
| `make ai-pull` | Start Ollama and pull the default model; override with MODEL=... |
| `make ai-models` | Read the public catalogue of free hosted models supporting JSON |

See [migration versioning and recovery](docs/migrations.md). The migration ledger records checksums and timestamps, prevents concurrent runs, and rejects changes to applied versions. Legacy project ownership is preserved.

### Development ports

Docker publishes the UI on **5174** and API on **3001**, keeping Vite's internal port fixed at 5173. Change host ports in `.env` (`FRONTEND_PORT`, `API_PORT`), or run `FRONTEND_PORT=5180 API_PORT=3002 make dev-up`. This recreates only this project's containers; it never kills another process to free a port.

Native Vite uses **5175**, then the next free port, and prints its actual URL. It proxies to the Docker API at `http://localhost:3001` by default, so it can run alongside Docker. For a native API listening on port 3000, run `API_PROXY_TARGET=http://localhost:3000 make dev-frontend`. Override native Vite with `DEV_PORT=5180 make dev-frontend`; set `DEV_STRICT_PORT=true` only when a fixed port is required. Keep `VITE_API_URL=/api` to use the proxy and avoid CORS issues when Vite chooses another port.
