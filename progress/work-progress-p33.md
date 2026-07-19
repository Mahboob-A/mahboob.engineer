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
