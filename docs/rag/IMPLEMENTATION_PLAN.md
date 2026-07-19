# RAG Terminal Implementation Plan

**Goal:** Add a dynamic RAG-backed mode to the landing hero terminal while
preserving the current static terminal as the default.

This plan is intentionally split into small commit-sized tasks. Each task must
follow the progress rulebook: code/docs, `pnpm typecheck`, progress update,
then commit with Mahboob's git identity env vars.

## T33.1 — Planning Docs

Create the RAG docs under `docs/rag/`:

- `ARCHITECTURE.md`
- `CORPUS_GUIDE.md`
- `IMPLEMENTATION_PLAN.md`
- `OPERATIONS.md`
- `PROVIDERS.md`

No runtime changes.

Verification:

- `pnpm typecheck`

## T33.2 — Corpus Scaffold

Add empty or starter corpus files under `docs/rag/corpus/`:

- `bio.md`
- `hiring.md`
- `project-deep-cuts.md`
- `writing-notes.md`
- `contact-policy.md`
- `private-boundaries.md`

Each file should contain prompts/placeholders for Mahboob to fill in, not
invented claims.

Verification:

- `pnpm typecheck`

## T33.3 — Dependencies And Env Contract

Install server-side dependencies:

```txt
openai
@upstash/vector
```

Update `.env.example`:

```txt
LLM_PROVIDER=fireworks
FIREWORKS_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
OPENAI_API_KEY=
RAG_CHAT_MODEL=accounts/fireworks/models/gpt-oss-120b
RAG_EMBEDDING_MODEL=accounts/fireworks/models/qwen3-embedding-8b
RAG_OPENAI_COMPAT_BASE_URL=https://api.fireworks.ai/inference/v1
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
```

`openai` is used as the reusable OpenAI-compatible client for Fireworks first,
then later for OpenAI/Groq-compatible APIs. Gemini should be added behind the
same provider interface when needed.

Verification:

- `pnpm typecheck`
- `pnpm build`

## T33.4 — Chunk Builder

Add `lib/rag/chunks.ts`:

- Reads `PROJECTS`, `EXPERIENCE`, `EDUCATION`, `BLOG_POSTS`, and `STACK`.
- Reads markdown corpus files from `docs/rag/corpus/`.
- Produces stable chunk ids and metadata.
- Computes a content hash for the complete corpus.

No network calls in this task.

Verification:

- `pnpm typecheck`
- Unit-style script smoke if the repo already has a script runner.

## T33.5 — Reindex Script

Add `scripts/rag-reindex.mjs` or `scripts/rag-reindex.ts` and package script:

```json
{
  "rag:reindex": "tsx scripts/rag-reindex.ts"
}
```

Behavior:

- Validate env vars (`UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN`).
- Build chunks from `lib/rag/chunks.ts:buildRagCorpus()`.
- **No embedding step in the script.** Each chunk is upserted to Upstash via
  `index.upsert({ id, data: text, metadata })`; Upstash embeds it server-side
  using the configured model. The script never calls an embeddings SDK.
- Store a corpus hash marker per vector.
- Skip if hash has not changed unless `--force` is passed.
- If the configured `RAG_UPSTASH_EMBEDDING_DIMENSIONS` does not match what
  Upstash reports via `index.info()`, abort with a clear error so the user
  recreates the index at the right dimension.

Verification:

- `pnpm typecheck`
- `pnpm rag:reindex -- --dry-run`
- Real reindex after env vars are available.

## T33.6 — RAG API Route

Add `app/api/rag/route.ts`.

Behavior:

- Validate JSON body.
- Accept only known terminal commands.
- Map command to a safe default question.
- Select provider via `LLM_PROVIDER`.
- Require the matching provider key, e.g. `FIREWORKS_API_KEY` for `fireworks`
  or `GEMINI_API_KEY` for `gemini`.
- Embed the question through the selected provider adapter.
- Retrieve top chunks from Upstash Vector.
- Stream grounded answer through the selected provider adapter.
- Return a useful `503` message if env vars are missing.

Security:

- Max input length.
- No model keys in client.
- No browser storage.
- Conservative system prompt.
- No Fireworks reasoning/thinking parameters.

Verification:

- `pnpm typecheck`
- `pnpm build`
- `curl` smoke for invalid payload.
- `curl` smoke for missing-env `503` behavior.

## T33.7 — HeroTerminal Static/Dynamic Toggle

Refactor `components/hero/HeroTerminal.tsx`:

- Add `mode: "static" | "dynamic"` state, default `"static"`.
- Replace terminal label with static/dynamic segmented buttons.
- Keep current `buildPayload()` code for static mode.
- Add dynamic command runner that calls `/api/rag`.
- Show blinking `$ mehboob@portfolio-bastion:` prompt in dynamic idle state.
- Keep contact CTA when command is `contact`.
- Add abort handling when user clears or switches mode mid-stream.

Verification:

- `pnpm typecheck`
- Targeted eslint for touched files.
- Browser smoke on `/`: static mode unchanged, dynamic mode idle prompt renders.

## T33.8 — Rate Limit And Cache

Add minimal protection:

- Per-IP rate limit for `/api/rag`.
- Optional response cache for identical command/question pairs.

Preferred simple v1:

- Skip cache.
- Add a small server-side rate limit only if Upstash Redis or Vercel KV is
  already available. If not, document the missing piece and keep route payload
  validation strict.

Verification:

- `pnpm typecheck`
- `pnpm build`

## T33.9 — QA And Launch Notes

Update docs after implementation:

- Real env var setup.
- Reindex instructions.
- Known failure modes.
- Smoke-test checklist.

Manual QA:

- Static mode works after hard reload.
- Dynamic mode streams for all six chips.
- Missing env vars show a friendly terminal message.
- No hydration warnings.
- No client bundle leak of server packages.

Verification:

- `pnpm typecheck`
- `pnpm build`
- Optional `pnpm lint` if pre-existing lint blockers are fixed.

## Open Decisions

- Whether dynamic mode remains chips-only or accepts freeform input.
- Whether Upstash Vector is final or the project should use another vector
  store.
- Whether the route should use streaming immediately or ship batch responses
  first.
- Whether corpus markdown files should be committed with full prose or kept as
  private local-only notes.
- Whether Gemini gets a separate first-class adapter in the first code pass or
  remains documented until the Fireworks path is stable.
