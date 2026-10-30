# Personal AI connections

Users can open **AI settings** from the navigation, or **Manage APIs** in the workspace/editor. The route is `/settings/ai` and requires sign-in.

## Supported providers

| Provider | Generation API | Model configuration |
| --- | --- | --- |
| OpenAI / GPT | Responses API, JSON mode, `store: false` | Editable model ID; GPT-4.1 is the initial suggestion |
| Anthropic / Claude | Native Messages API | Editable model ID; Claude Sonnet, Opus and Haiku suggestions |
| xAI / Grok | Chat Completions API | Editable Grok model ID |
| Google / Gemini | OpenAI-compatible Chat Completions API | Editable Gemini model ID |
| Groq | Chat Completions API | Editable model ID; Groq is distinct from xAI's Grok |
| OpenRouter | Chat Completions API | Free router, `vendor/model:free`, or a paid `vendor/model` |
| Ollama | Existing administrator-managed local server | No personal API key; use the configured server default |

Suggestions are starting points, not claims of account access or the latest/best model. Users can enter another compatible text-generation model from their provider. Image-only, audio-only, tool-only, and arbitrary custom endpoints are not supported. A successful key check does not prove model access, available quota, or generation quality.

Protocol references: [OpenAI text generation](https://developers.openai.com/api/docs/guides/text), [OpenAI JSON mode](https://developers.openai.com/api/docs/guides/structured-outputs), [Claude Messages](https://platform.claude.com/docs/en/build-with-claude/working-with-messages), [Grok Chat Completions](https://docs.x.ai/developers/rest-api-reference/inference/chat-completions), [Gemini compatibility](https://ai.google.dev/gemini-api/docs/openai), [Groq compatibility](https://console.groq.com/docs/openai), [OpenRouter authentication](https://openrouter.ai/docs/api/reference/authentication).

## User flow

1. Select a provider card, name the connection, select or type a model ID, and enter the provider's API key.
2. Accept the billing notice and save. API charges belong to the user's provider account; a consumer chat subscription does not necessarily include API access.
3. Optionally use **Check key**. This makes a metadata/authentication request, not an inference request. A restricted key without permission to the provider's metadata endpoint can fail this check even if it has generation permission.
4. Choose **Use by default**, or select a connection for an individual generation/refinement in the workspace or editor.
5. Edit the model/name or replace the key. A blank replacement field preserves the stored key. One connection per provider is currently supported.
6. Remove a saved connection to delete its encrypted credential from the live database. This does not revoke the key at its provider or remove copies in existing backups. Deleting the active default resets future default selection to the server configuration. Requests still referring to the deleted ID fail rather than silently choosing another key.

The selected connection's key is used only for that user's requests. A failed request never falls back to another user's key, the application's key, another model, or another provider. There are no automatic generation retries. The browser sends a connection ID for generation, not an API key.

### Billing and free-only defaults

The project owner explicitly enabled paid **personal** API connections. Saving a connection requires `billingAccepted: true`; the database records the acceptance timestamp. The API resolves the selected connection server-side and marks that individual request as user-funded. Clients cannot supply a provider override, endpoint override, or environment override in a generation request.

`AI_FREE_ONLY=true` still controls the **application/server default**. Its local Ollama and OpenRouter free routes are unchanged. Personal connections can select paid providers/models without changing the shared server configuration. Personal OpenRouter connections targeting `openrouter/free` or `:free` models still send zero price caps. Paid personal OpenRouter requests use the exact selected model without those caps. No paid tools, browsing plugins, or preset routes are enabled.

Input/output limits still apply, and provider quota or billing failures are shown. The app cannot estimate a final bill or enforce a provider-account-wide spending cap; users should set limits with the provider.

## Key storage and deployment

Keys are encrypted with AES-256-GCM using a dedicated `API_KEY_ENCRYPTION_KEY` (32 random bytes, base64 encoded). Every encryption uses a fresh nonce. The owner ID, connection ID and provider ID are authenticated with the ciphertext so moving a stored credential between owners/providers fails decryption. Secret fields are excluded from normal database queries and JSON serialization. HTTP responses contain only metadata and the last four characters of the key, and settings responses use `Cache-Control: no-store`.

Keys live briefly in the form while being entered and in server memory while processing a request. They are not written to localStorage/sessionStorage, included in generated projects, or returned after saving. Use HTTPS outside localhost, and configure infrastructure logging to exclude request bodies and credentials. Encryption at rest does not protect against a compromised running application with access to the encryption secret.

### Docker setup

```sh
make setup
make dev-restart
make migrate-status
```

`make setup` generates the encryption secret in the ignored root `.env` if it is absent or blank and preserves existing nonempty secrets. Recreating the API loads it. **Back up the encryption secret separately from the database and keep it stable across deploys.** Do not replace it to rotate credentials: existing saved keys would become unreadable. To rotate the master secret, first implement/review a re-encryption procedure or have users remove and re-enter their connections. The secret is never printed by setup.

The current local stack has been configured and migrated. On other deployments, missing/invalid encryption configuration disables saving/using encrypted credentials with an actionable error. Existing application-default generation remains available. Native installations need the same dedicated secret in `backend/.env`; transfer it through a secret manager or generate a new one for a fresh database. Never put it in a `VITE_` variable or commit it.

Migration `20261022000300_user_ai_connections.js` adds the unique `(owner, provider)` index, initializes users' `activeAiConnection` to null, and advances users' document schema version to 2. It preserves existing accounts, passwords, response history and prior migration checksums.

## HTTP API

All endpoints require the user's bearer session token. Connection IDs are always checked against the authenticated owner.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/ai-settings` | Supported provider definitions, masked saved connections, current default and storage readiness |
| POST | `/api/ai-settings/connections` | Save `provider`, `label`, `model`, `apiKey`, `billingAccepted: true` |
| PUT | `/api/ai-settings/connections/:id` | Update label/model, optionally replace apiKey; require billing acceptance |
| DELETE | `/api/ai-settings/connections/:id` | Delete owned connection and clear matching default |
| PUT | `/api/ai-settings/default` | Set `connectionId` to an owned connection ID, or null for server default |
| POST | `/api/ai-settings/connections/:id/check` | Check provider authentication/metadata access without generating |

`POST /api/projects/generate` and `/update` accept optional `connectionId`: omitted uses the user's saved default; null explicitly selects the application's default; a string selects the owned connection. Selecting an unavailable/deleted connection fails with 404. Credential failures return an AI error without logging the user out. Key-check requests are limited to five per user per minute; existing API/generation rate limits remain in place.

## Verification

Tests cover encryption randomness/tampering/context binding, missing master secrets, provider request/response formats, paid personal vs free shared defaults, fixed outbound endpoints, masked serialization, no credential fallback, real-Mongo CRUD, cross-account denial, key replacement, deletion/default reset, and generation/refinement with a selected key. Provider calls use synthetic responses; no real paid API calls or real personal keys were used. Browser checks cover desktop/mobile settings, key visibility, billing consent, add/edit/remove, default selection and workspace/editor routing.
