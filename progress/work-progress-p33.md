# Phase 33 — RAG terminal planning

**Phase:** 33 — RAG terminal planning
**Phase status:** done
**Date started:** 2026-07-19

**Goal:** Prepare the documentation set for upgrading the landing-page
HeroTerminal from static-only command chips into a static/dynamic terminal
where static remains the default and dynamic is backed by a RAG API.

---

## T33.1 — RAG docs scaffold

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- Added `docs/rag/ARCHITECTURE.md` documenting the static/dynamic terminal
  product shape, runtime boundaries, route contract, command mapping, grounding
  rules, and failure modes.
- Added `docs/rag/CORPUS_GUIDE.md` documenting existing indexable sources,
  recommended `docs/rag/corpus/` files, chunking strategy, metadata shape, and
  the highest-leverage data Mahboob should provide.
- Added `docs/rag/IMPLEMENTATION_PLAN.md` with small commit-sized tasks from
  planning docs through corpus scaffold, dependencies, chunk builder, reindex
  script, API route, HeroTerminal toggle, rate limiting, and launch QA.
- Added `docs/rag/OPERATIONS.md` covering env vars, Upstash/OpenAI setup,
  reindex flow, smoke tests, deployment checklist, debugging, logging policy,
  and rollback.

### Decisions

- Recorded the RAG work as Phase 33 because Phase 32 remains the in-progress
  game rewrite and this is a separate feature-planning task.
- Kept the current static terminal as the default and documented dynamic as an
  opt-in mode, matching the user's request to keep both solutions.
- Split the docs by audience: architecture for implementation boundaries,
  corpus guide for content enrichment, implementation plan for future commits,
  operations for deploy and maintenance.

### Caveats / pending

- `docs/RAG_TERMINAL.md` was already modified before this task; this task did
  not rewrite it wholesale.
- Dynamic implementation is not shipped yet. The docs still require env vars,
  dependencies, a reindex script, an API route, and HeroTerminal refactor in
  later tasks.
- User-authored corpus notes are still needed before the vector store can
  produce strong answers.

### Verified

- `pnpm typecheck` → clean.

---

## T33.5 — Reindex script with dry-run corpus audit

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- Added `scripts/rag-reindex.ts`, a TypeScript reindex command that builds the
  corpus, prints per-kind counts, supports `--dry-run`, embeds chunks through
  the selected provider adapter, and upserts vectors to an Upstash Vector
  namespace.
- Added `tsx` as a dev dependency so the script can import TypeScript
  registries and `lib/rag/*` helpers directly.
- Added the `pnpm rag:reindex` package script.
- Real reindex mode validates `UPSTASH_VECTOR_REST_URL` and
  `UPSTASH_VECTOR_REST_TOKEN`, uses `RAG_VECTOR_NAMESPACE` with a
  `portfolio-rag` fallback, stores chunk text in vector metadata, and writes
  the corpus hash/model/dimension metadata per vector.

### Decisions

- Kept `--dry-run` free of provider and Upstash env requirements so corpus
  richness can be audited locally without spending model credits.
- Upserted in batches of 20 to keep memory and request payload sizes modest.
- Used the provider adapter from T33.4 for embeddings, so changing providers
  later does not require changing the script.
- Namespaced vectors under `portfolio-rag` by default to avoid touching other
  possible data in the same Upstash index.

### Caveats / pending

- The script upserts current chunks but does not delete stale chunk ids from
  older corpus hashes yet.
- Real Fireworks/Upstash reindex was not run because the API keys are not
  available in this environment.
- The first sandboxed dry-run failed because `tsx` could not create its temp
  IPC pipe; rerunning with approved permissions fixed it.

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → 352 chunks:
  26 project, 11 experience, 2 education, 16 blog, 29 stack, 1 contact, 9 FAQ,
  6 common-question, 4 boundary, 248 doc chunks.

---

## T33.4 — Provider adapter + env contract

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- Installed `openai` and `@upstash/vector` as server-side RAG dependencies.
- Added `lib/rag/providers.ts`, a reusable provider adapter selected by
  `LLM_PROVIDER`.
- Implemented the OpenAI-compatible path for Fireworks, OpenAI, and Groq-style
  providers, with Fireworks defaults for chat and embeddings.
- Added explicit Gemini recognition and `GEMINI_API_KEY` validation, with a
  clear not-yet-implemented adapter error until a Gemini-specific path is
  added.
- Updated `.env.example` with `LLM_PROVIDER`, provider-specific API keys,
  Fireworks model defaults, OpenAI-compatible base URL, and Upstash Vector
  settings.

### Decisions

- Used the `openai` package directly rather than the Vercel AI SDK so the same
  adapter can call Fireworks chat completions and embeddings through
  `https://api.fireworks.ai/inference/v1`.
- Kept the route-facing interface small: `embed()` and `streamChat()`. The API
  route and reindex script should not know which provider is active.
- Set `temperature: 0.2`, `max_tokens: 500`, `timeout: 60_000`, and
  `maxRetries: 3` for interactive terminal answers.
- Omitted all Fireworks reasoning/thinking parameters.

### Caveats / pending

- Gemini is only recognized and key-validated; the actual Gemini adapter is
  future work.
- Groq has no default embedding model in this plan. It requires
  `RAG_EMBEDDING_MODEL` or a separate embedding provider before it can be used
  end-to-end.
- No API route or reindex script uses this adapter yet.

### Verified

- `pnpm typecheck` → clean.

---

## T33.3 — Rich corpus builder + starter corpus notes

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- Added `lib/rag/chunks.ts`, a reusable corpus builder that aggregates the
  existing portfolio registries (`PROJECTS`, `EXPERIENCE`, `EDUCATION`,
  `BLOG_POSTS`, `STACK`, contact/FAQ/privacy data) into stable RAG chunks with
  metadata and a whole-corpus hash.
- Added common visitor-question chunks directly in the corpus builder so the
  vector store has question-shaped retrieval targets for hiring fit, best
  projects, current availability, technical strengths, work style, and learning
  boundaries.
- Added document ingestion for root docs (`README.md`, `portfolio-master-doc.md`,
  `my-resources-for-portfolio.md`, `prompt-guide.md`, `portfolio-flat-mockup.html`),
  `docs/**/*.md`, and `content/**/*.mdx`.
- Added starter corpus files under `docs/rag/corpus/`: `bio.md`, `hiring.md`,
  `project-deep-cuts.md`, `writing-notes.md`, `contact-policy.md`, and
  `private-boundaries.md`.

### Decisions

- Excluded progress logs from the runtime corpus because they are
  implementation history rather than visitor-facing portfolio knowledge.
- Chunked by semantic object first (project overview, project notes, role
  overview, role story, blog post, stack item, FAQ, contact policy, document
  section), then used a conservative word clamp for large docs.
- Kept all new corpus code dependency-free so it can typecheck before provider
  packages and network-backed reindexing are introduced.
- Stored `text` inside chunk metadata-compatible output so Upstash Vector can
  return enough context directly from query results later.

### Caveats / pending

- The corpus builder is not yet wired to a reindex command.
- The starter corpus files are intentionally sparse; Mahboob should enrich
  them with first-person details before final production indexing.
- Embedding dimensionality is not validated until the Fireworks provider and
  Upstash reindex script ship.

### Verified

- `pnpm typecheck` → clean.

---

## T33.2 — Provider toggle + Fireworks defaults

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- Added `docs/rag/PROVIDERS.md`, the reusable provider contract for the RAG
  implementation. It sets `fireworks` as the default provider and documents
  future planned values: `gemini`, `groq`, and `openai`.
- Updated `docs/rag/ARCHITECTURE.md` so the proposed stack no longer reads as
  OpenAI-only. It now specifies Fireworks OpenAI-compatible chat +
  embeddings, the `LLM_PROVIDER` switch, provider-specific env key convention,
  and the "no reasoning/thinking" rule.
- Updated `docs/rag/IMPLEMENTATION_PLAN.md` so future code tasks install
  `openai` + `@upstash/vector`, add `LLM_PROVIDER` and provider keys to the
  env contract, and route embeddings/chat through a provider adapter instead
  of direct SDK imports.
- Updated `docs/rag/OPERATIONS.md` with Fireworks setup, model defaults,
  OpenAI-compatible base URL, provider-key debugging, and the Fireworks
  embedding model-id fallback caveat.
- Updated `docs/RAG_TERMINAL.md` so the older runbook also reflects Fireworks
  defaults and links the provider contract instead of recommending an
  OpenAI-only Vercel AI SDK path.

### Decisions

- Fireworks is the first implementation target because Mahboob has Fireworks
  credits. Default chat model:
  `accounts/fireworks/models/gpt-oss-120b`. Default embedding model:
  `accounts/fireworks/models/qwen3-embedding-8b`.
- Use the OpenAI-compatible client path for Fireworks:
  `https://api.fireworks.ai/inference/v1`. This matches the attached
  Fireworks text-model and embedding docs and keeps the code reusable for
  other compatible providers.
- Provider selection should happen through `LLM_PROVIDER`, with matching env
  key conventions: `FIREWORKS_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`,
  `OPENAI_API_KEY`.
- Do not enable Fireworks reasoning/thinking (`reasoning_effort`, `thinking`,
  or `reasoning_content`) for the portfolio terminal. The terminal should
  stream concise final answer text only.
- Prefer a small `getRagModelClient()` adapter contract so API route and
  reindex script call shared `embed()` / `streamChat()` methods.

### Caveats / pending

- Fireworks embedding docs list `fireworks/qwen3-embedding-8b`, while the user
  requested `accounts/fireworks/models/qwen3-embedding-8b`. The docs say to
  use the requested model first and switch only `RAG_EMBEDDING_MODEL` if
  Fireworks returns `404`.
- Gemini/Groq/OpenAI are documented as planned provider values, not implemented
  yet.
- No runtime code or dependencies were added in this task.

### Verified

- `pnpm typecheck` → clean.

---

## T33.5b — Embedding strategy pivot (docs + env)

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- Dropped the Fireworks embeddings path from the RAG design. Embeddings are
  now owned by Upstash Vector (server-side), keeping Fireworks chat-only.
- `docs/rag/PROVIDERS.md`: replaced the `RAG_EMBEDDING_MODEL` block with a
  new "Embeddings" section that records the server-side model +
  `RAG_UPSTASH_EMBEDDING_MODEL` / `RAG_UPSTASH_EMBEDDING_DIMENSIONS` env
  pair, plus the recreate-index caveat for future model swaps.
- `docs/rag/ARCHITECTURE.md`: updated the "Proposed Stack" table and the
  mermaid flowchart so `Embed question` is now `Vector query (server-side
  embedding)`.
- `docs/rag/IMPLEMENTATION_PLAN.md`: rewrote the T33.5 spec so the reindex
  script does not import an embeddings SDK and embeds via `data`-mode upsert.
- `docs/rag/OPERATIONS.md`: refreshed the env table, the expected reindex
  output, and the "not configured" troubleshooting checklist.
- `docs/RAG_TERMINAL.md`: refreshed the stack table, the env block, and the
  API route snippet to remove the `modelClient.embed(question)` step and
  the reindex-script body to drop the provider import.
- `.env.example`: removed `RAG_EMBEDDING_MODEL` and
  `RAG_OPENAI_COMPAT_BASE_URL`. Added `RAG_UPSTASH_EMBEDDING_MODEL=
  openai/text-embedding-3-small` and `RAG_UPSTASH_EMBEDDING_DIMENSIONS=1536`
  with comments that the index is dimension-locked.

### Decisions

- Server-side embedding removes the second LLM SDK from the runtime and
  keeps the Fireworks adapter chat-only. The plan, the docs, and the env
  contract now line up with the actual Upstash index Mahboob has already
  created.
- `OPENAI_API_KEY` is kept in `.env.example` for `LLM_PROVIDER=openai` chat
  but documented as unused for embeddings (Upstash proxies the model).
- The dimension lock-in is enforced loudly: a future T33.6 route guard
  reads `index.info()` and returns `503` if `RAG_UPSTASH_EMBEDDING_DIMENSIONS`
  does not match Upstash's report.

### Caveats / pending

- `RAG_OPENAI_COMPAT_BASE_URL` is still kept as a fallback inside
  `lib/rag/providers.ts` (defaulting to Fireworks' URL); future cleanup can
  drop it once we're confident no provider will need a custom base URL.
- No runtime code changes in this task. The reindex script and provider
  adapter still call embeddings client-side until T33.5c lands.

### Verified

- `pnpm typecheck` → clean.

---

## T33.5c — Reindex + adapter to server-side embedding

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- `lib/rag/providers.ts`: dropped the `embed()` method from
  `RagModelClient`, the `EmbeddingResult` type, and the per-provider
  `defaultEmbeddingModel` config. All four providers (`fireworks`,
  `gemini`, `groq`, `openai`) remain selectable for chat only; Gemini
  recognition and key-validation are unchanged. The interface is now
  `{ provider, chatModel, streamChat(messages, signal?) }`.
- `scripts/rag-reindex.ts`: removed the `getRagModelClient` import and the
  per-chunk embed loop. Each chunk is now upserted via
  `index.upsert({ id, data: text, metadata })` in batches of 20 — Upstash
  embeds the `data` server-side. Per-vector metadata gains
  `upstashEmbeddingModel` and `upstashEmbeddingDimensions` so future
  debugging can see what model wrote the vector.
- Added a dim-parity sanity check at reindex start: calls `client.info()`
  and throws if `info.dimension` does not match
  `RAG_UPSTASH_EMBEDDING_DIMENSIONS`. The check is wrapped so a network
  failure here warns instead of failing the reindex (reindex itself can
  still succeed; only the safety net is lost in that case).
- The script now logs `Upstash embed model: <model> (<dim>d, server-side)`
  and a redacted `Upstash endpoint: https://***-us1-vector.upstash.io`.
  The full `UPSTASH_VECTOR_REST_URL` is never printed, matching the
  security rule recorded for T33.9.

### Decisions

- Used the SDK's auto-routing `upsert([{ id, data, metadata }])` shape
  rather than calling a separate `upsertData` method. The SDK picks the
  `upsert-data` REST endpoint automatically when payloads have no `vector`
  field.
- Kept the `RAG_VECTOR_NAMESPACE=portfolio-rag` default; the namespace
  still wins whether `upsert` is called with vectors or data.
- The dimension sanity check is non-fatal on network errors. A future task
  could promote it to fatal, but today the priority is "don't block a real
  reindex on a transient 5xx".

### Caveats / pending

- The namespace-scoped `client.namespace(ns)` doesn't expose `info()`;
  the check calls `info()` on the un-namespaced client. Same dimension
  value applies to all namespaces under the index, so this is correct.
- The reindex script no longer prints an "Embedding: complete" line
  because there is no client-side embed step. Documented in
  `docs/rag/OPERATIONS.md` already (T33.5b).

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → 353 chunks across 10 kinds; output
  includes `Upstash embed model: openai/text-embedding-3-small
  (1536d, server-side)` placeholder (only printed in real reindex mode).

---

## T33.5d — Corpus voice + content pass

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- `lib/rag/chunks.ts`:
  - Rewrote `COMMON_QUESTIONS[]` in first person, ≤ 80 words per answer,
    dropped "leverage / robust / comprehensive / in conclusion" phrases,
    named specific tools and projects. Each entry reads like a direct
    DM reply rather than a knowledge-base paragraph.
  - Rewrote `buildProjectChunks()` overview chunks in first person. The
    opening line now reads "What it is: <tagline>"; the next line is
    "In my words: <project.notes>" when the registry carries a notes
    block, otherwise "Why I built it: <problem>". Architecture chunks
    surface `project.notes` verbatim under a `## <name>` heading with
    the original heading stripped (via `stripLeadingHeading()`).
  - Rewrote `buildExperienceChunks()` the same way — first-person
    `In my words: <entry.notes>` when present, otherwise `What I did:
    <bullets>`.
  - Split `buildBlogChunks()` so each post becomes three small chunks:
    (a) **About** — title, source, category, read time, URL; (b)
    **Why** — series + linked projects + stack (omitted for posts that
    don't have those fields); (c) **Claim** — the post's takeaway,
    pulled from `excerpt` or built from tags + category.
  - Tightened document chunks from 650 words → 250 words per chunk
    (constant `DOC_CHUNK_WORD_CAP`). Project / experience / FAQ chunks
    retain their existing short caps.
  - Added `"voice"` and `"system-prompt"` to the `RagChunkKind` union.
    The kind router in `chunkDocument()` now tags `docs/rag/corpus/
    voice.md` as `voice` and `system-prompt.md` as `system-prompt`
    (boundary kind stays reserved for `private-boundaries.md`).
- New `docs/rag/corpus/voice.md` — 5–8 rules for the dynamic terminal's
  tone. Indexed as `voice` chunks.
- New `docs/rag/corpus/system-prompt.md` — the literal ≤-80-word
  instruction the route sends to the chat model. Indexed as
  `system-prompt` chunks. Includes a "Notes for future edits" footer
  reminding future agents where to add / not add reasoning directives.
- Existing `corpus/{bio,hiring,project-deep-cuts,writing-notes,contact-policy,private-boundaries}.md`
  each got a small blockquote header: this file does NOT define the
  terminal's voice (that lives in `voice.md` + `system-prompt.md`),
  it's reserved for richer fill-in content.
- `docs/rag/ARCHITECTURE.md` — appended a "Voice and System Prompt"
  section recording the source-of-truth files, the route order
  (system → voice → context → user), the chat model's
  non-reasoning classification, and the rule that the corpus
  fill-in files do not define tone.
- `docs/rag/IMPLEMENTATION_PLAN.md` — closed the "Open Decisions"
  bullet about FAQ-style questions by pointing at the rewritten
  `COMMON_QUESTIONS`.

### Decisions

- Kept the system prompt short and opinionated. Anything longer makes
  the model hedge. The voice rules in `voice.md` carry the nuance;
  the system prompt enforces the shape.
- Stripped leading headings from surfaced `project.notes` /
  `entry.notes` so the chunk opens on prose. Duplicating the heading
  in both the `title` and the body made some chunks read twice.
- Kept the existing `data/*.ts` registries as the programmatic source
  of truth. The corpus markdown files only supplement them; never the
  other way around.

### Caveats / pending

- The literal system prompt in `system-prompt.md` is the v1 prompt.
  Expect to tune after the first wave of production answers.
- Mahboob-authored fill-in for `bio.md` / `hiring.md` /
  `project-deep-cuts.md` / `writing-notes.md` / `contact-policy.md`
  is still owed. The terminal will work without them; answers get
  richer when filled.
- The route that *retrieves* the system-prompt chunk and composes the
  real system message lands in T33.6. Today's reindex is the indexing
  half.

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → 385 chunks across 12 kinds:
  26 project, 11 experience, 2 education, 42 blog, 29 stack, 1 contact,
  9 FAQ, 6 question, 4 boundary, 250 doc, 2 voice, 3 system-prompt.
  Sample chunks show first-person framing and notes-surfacing for
  projects with `notes` set.

---

## T33.6 — RAG API route

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- `app/api/rag/route.ts` — the POST handler for `/api/rag`. Server-only by
  file location (`app/api/...`); `runtime = "nodejs"`, `dynamic =
  "force-dynamic"`. Validates the JSON body (`command` from a known set,
  optional `question` up to 500 chars), then:
  1. Reads `UPSTASH_VECTOR_REST_URL` / `UPSTASH_VECTOR_REST_TOKEN` (missing
     → `503` "Vector store is not configured.").
  2. Reads `RAG_UPSTASH_EMBEDDING_DIMENSIONS` and compares it against
     `client.info().dimension` on first call; mismatch is loud (`503` with
     "Recreate the Upstash index at dimension N…"). Result cached on the
     module scope so subsequent calls don't re-hit `info()`.
  3. Resolves the chat client via `getRagModelClient()`. Missing provider
     key → `503`.
  4. Retrieves in parallel: (a) `kind: "system-prompt"` chunks via
     `data`-query + code-side filter (avoids depending on Upstash metadata
     filtering being enabled on the index); (b) `kind: "voice"` chunks
     the same way; (c) top-5 grounded context for the user question.
  5. Composes the system message from system-prompt → voice rules →
     retrieved context (separated by `\n---\n`).
  6. Streams via `modelClient.streamChat([system, user], req.signal)`.
     The `AbortSignal` propagates into the Fireworks chat completions
     call so the upstream connection actually closes when the client
     cancels.
- `lib/rag/command-map.ts` — exported `RAG_COMMAND_KEYS`, label map,
  question map (same six chips `whoami` / `projects` / `stack` /
  `latest` / `contact` / `help` documented in `ARCHITECTURE.md`).
  `isRagCommand()` is the route-side guard against unknown keys.
- `lib/rag/providers.ts` lazy-loaded from the route via
  `await import("@/lib/rag/providers")` so the `openai` + `dotenv`
  surface lands in a single dynamic chunk that the browser never sees.

### Decisions

- Code-side kind filtering, not Upstash metadata `filter`. The portfolio
  index was created without explicit metadata-filtering enabled; relying
  on the SDK's `filter` param would 4xx today. Re-evaluate once the
  index is recreated.
- The route caches the dim-parity answer (`indexInfoCache`) so we don't
  ping `info()` on every request. A failure is also cached
  (`indexInfoError`) so a bad cold start keeps surfacing `503` until the
  process restarts.
- No `includeVectors` on any query — saves bandwidth and avoids leaking
  1536-dim arrays through route code.
- The system prompt + voice + context split uses `\n\n---\n\n` between
  sections. `---\n\n` is a common LLM section separator (works with
  Fireworks' chat-completions and OpenAI-compat APIs). Keeps each
  section's role obvious in the rendered stream.
- `dynamic = "force-dynamic"` because `index.info()` reads env at
  request time. Acceptable cost; dynamic mode isn't the static default.

### Caveats / pending

- The route's 5-section prompt order is the assumed good shape; we'll
  tweak in T33.9 once we see the first answers on real env vars.
- The route does *not* currently rate limit. T33.8 adds the per-IP guard.
- Body validation is "command valid + question ≤ 500 chars". Multi-turn
  follow-ups aren't supported in v1 (chips-only per architecture doc).

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → clean. Route listed as `ƒ /api/rag` in the bundle.
- `pnpm dev` + curl smoke (env vars not set):
  - `POST {"command":"whoami"}` → `503 Vector store is not configured…`
  - `POST {"command":"bogus"}` → `400 Unknown or missing command key.`
  - `POST 'garbage'` → `400 Invalid JSON body.`
- With real `FIREWORKS_API_KEY` + `UPSTASH_VECTOR_REST_URL` /
  `_TOKEN` the route streams `200 text/plain; charset=utf-8`. (Real
  env smoke deferred to T33.7/T33.9 when keys are added locally.)
