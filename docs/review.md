# Review and implementation notes

For the latest model availability checks, free-only provider changes, folder layout, and prioritized remaining gaps, see [Free AI and workflow review](free-ai-and-workflow.md).

Personal paid API connections are now supported separately from the free shared default; see [API connections](api-connections.md).

## Issues addressed

| Finding | Change |
| --- | --- |
| Generation and all saved responses were public | Bearer authentication, per-owner database filters, generation rate limits, pagination |
| No input bounds; database errors returned verbatim | Request validation, safe errors, JSON body limit, duplicate-account handling |
| Startup listened before DB readiness | Await DB connection, readiness endpoint, graceful shutdown |
| Obsolete hardcoded model and required Groq client at import time | Provider service with local Ollama default, optional Groq, configurable model, timeout, output validation |
| System prompt required CRA and prohibited Tailwind | Complete Vite + React + Tailwind 4 project contract |
| Broken deployment URL and browser token collection | Provider-independent ZIP export with complete source; no automatic publishing |
| Contact sent to submitter using hardcoded sender | Configurable SMTP, team recipient, submitter reply-to, validation and rate limiting |
| Frontend called hardcoded production URLs | Shared API client and local development proxy; removed obsolete Vercel configs |
| Project cache leaked across projects/accounts | Session-scoped cache, clear on logout, explicit project selection, current edits included in update requests |
| Invalid generation could navigate to stale output | Parse before saving/navigation; visible errors and retry path |
| Unused refresh-token workflow | Explicit expiring sessions with reauthentication |
| Repeated UI, full-page navigation, hidden mobile navigation | Shared responsive layout and links, mobile menu, keyboard focus, accessible form labels, password visibility controls |
| No reproducible dev setup or CI | Dockerfiles, Compose, Node watch, Vite HMR, tracked lockfiles, CI, regression tests |
| Unused SDKs and competing component/editor libraries | Removed StackBlitz, Monaco, Flowbite, Framer Motion, unused crypto and HTTP packages |

## Integration choices

- **Ollama + Qwen2.5 Coder**: default local generation, no API account or per-call bill. Quality and latency depend on model and hardware; this is not a claim that a 7B local model outperforms a hosted model. [Ollama API](https://docs.ollama.com/api/chat), [model](https://ollama.com/library/qwen2.5-coder:7b).
- **OpenRouter**: optional hosted provider restricted to free model IDs and zero prompt/completion/request price ceilings. Quotas and availability apply; use `make ai-models` to inspect the current public catalogue. [Free routing](https://openrouter.ai/openrouter/free).
- **Groq**: legacy adapter retained, but blocked by the default `AI_FREE_ONLY=true` policy because account billing cannot be enforced here. Explicit opt-in with `AI_FREE_ONLY=false` is outside the free-only setup. [Models](https://console.groq.com/docs/models).
- **Mailpit**: local SMTP capture replaces Gmail credentials in development. It does not deliver production mail. Set production SMTP credentials and CONTACT_TO explicitly. [Mailpit](https://mailpit.axllent.org/docs/).
- **Sandpack**: a single editor/preview integration replaces the split Monaco/StackBlitz setup. Preview still needs CodeSandbox's hosted bundler, npm package access, and a Tailwind CDN runtime. It is not an offline or exact production-build environment. Custom Tailwind config, Vite plugins, and arbitrary backend code need verification in the exported project. [Sandpack](https://sandpack.codesandbox.io/docs/getting-started/usage).
- **ZIP export**: replaces the nonfunctional Vercel deployment button. Users can choose a host without handing a hosting token to this application. Export does not publish a site.

## Migration and remaining limits

Existing response documents have no owner. They are intentionally excluded from user queries. Do not guess ownership or expose them globally; an administrator must map legacy records to verified user IDs before making them available. Existing password hashes remain supported. Existing users must sign in again because persistent localStorage tokens are retired.

Old localStorage project caches are preserved but never loaded into the new workspace. Export valuable browser-only drafts using the old version before switching. Server-saved responses are untouched. New manual edits persist only in the current browser session; generated revisions persist on the server. Closing the session discards unexported manual edits.

JWTs use sessionStorage and remain accessible to application JavaScript. A production session system should use HttpOnly cookies with CSRF protection, revocation, password reset, and verified email. Current single-instance rate limits use memory; multiple replicas need a shared store and an explicit trusted proxy configuration. Development MongoDB is internal to Compose without authentication; production requires authentication, backups, TLS, and restricted network access.

Generated projects are checked for JSON shape, file paths, required Vite files and package manifest fields, not guaranteed to compile or be secure. The browser preview is isolated by Sandpack; exported code must be reviewed before running or publishing. No live model inference is covered by the unit test suite. Provider errors remain visible and do not create placeholder projects.

The UI is original, inspired by the spacing, typography, blue palette, and geometric visual language of [Atlassian](https://www.atlassian.com/). It does not use Atlassian branding or assets.

## Verification performed

- Frontend ESLint and Vite production build passed. The editor is lazy loaded; its Sandpack bundle still produces a size advisory (~612 kB before gzip).
- Ten API regression tests passed, including authentication, owner-scoped lookup, malformed requests, readiness, and generated-file validation.
- Both dependency audits reported zero known vulnerabilities after upgrades (at the time of this review).
- Docker development services were exercised against real MongoDB and Mailpit: registration, login, token validation, owned project listing, generation authorization, unavailable-provider errors, and SMTP delivery passed.
- Chromium checks passed at desktop and 390px mobile sizes, with no page JavaScript errors: navigation, password visibility, protected routes, registration, editor, ZIP export, and clearing project state on logout. Editor/export generation used an explicit test fixture, not live AI output.
- Frontend hot reload was verified by changing a footer string and observing it update without a page refresh, then restoring it.
- Live model inference has not been verified; start the local-ai profile and pull the configured model before generating.
- Backend watch mode was verified: a source edit restarted the API and readiness recovered.
- The production Nginx frontend image built successfully.
- Production SPA fallback and Nginx-to-API proxy passed live HTTP checks; the temporary production test container was removed.
- The final API Docker image built successfully. Development services remain running on UI port 5174, API port 3001, and mail inbox port 8025.
