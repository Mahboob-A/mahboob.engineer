# RAG Terminal Operations

**Purpose:** Day-to-day setup, reindexing, deployment, and debugging notes for
the dynamic hero terminal.

> **For command-level documentation** (`pnpm rag:reindex` flags, when
> to run them, embedding caching behaviour), see
> [`rag-management.md`](./rag-management.md). This file is organized by
> topic (env, debug, security); that file is organized by command.

## Required Services

1. Fireworks API key for chat.
2. Upstash Vector index (embeddings + storage; server-side).
3. Vercel environment variables for production and preview.

Recommended Upstash Vector settings:

- Type: dense.
- Distance metric: cosine.
- Embedding model: `openai/text-embedding-3-small`.
- Dimensions: 1536 (native dim of `text-embedding-3-small`). **Index is
  dimension-locked at creation.**
- Region: closest to Vercel deployment. The portfolio index lives in `us1`.

## Environment Variables

Local `.env.local`:

```txt
LLM_PROVIDER=fireworks
FIREWORKS_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
OPENAI_API_KEY=
RAG_CHAT_MODEL=accounts/fireworks/models/gpt-oss-120b
RAG_UPSTASH_EMBEDDING_MODEL=openai/text-embedding-3-small
RAG_UPSTASH_EMBEDDING_DIMENSIONS=1536
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
```

`RAG_UPSTASH_EMBEDDING_MODEL` and `RAG_UPSTASH_EMBEDDING_DIMENSIONS` must
match what you selected at Upstash index creation. The index is
dimension-locked; the API route reads `index.info()` on first call and returns
`503` if the configured dimension does not match the index.

Vercel:

- Add all required variables to Production.
- Add all required variables to Preview if dynamic mode should be tested
  before release.
- Redeploy after adding or changing variables.

## Reindex Flow

Run after changing:

- `data/projects.ts`
- `data/experience.ts`
- `data/blog.ts`
- `data/stack.ts`
- `docs/rag/corpus/*.md`

Commands:

```txt
pnpm rag:reindex -- --dry-run     # local: count + sample, no network
pnpm rag:reindex -- --reset       # production: wipe namespace, then re-embed
pnpm rag:reindex -- --reset-all   # rare: wipe every namespace, then re-embed
```

`--reset` is the production-default behavior. Wipes the `portfolio-rag`
namespace before upserting, so any chunk whose id no longer matches the
current corpus is dropped from the index. Upstash re-embeds every chunk
fresh — for the current ~430 chunks this costs fractions of a cent.

Without `--reset` the reindex is additive: existing ids re-use their cached
vectors, new chunk ids get fresh embeddings, deleted chunks stay in the
index as stale vectors. Use `--reset` on every production deploy so the
namespace always matches the corpus exactly.

`--reset-all` is the rare escape hatch when you rename `RAG_VECTOR_NAMESPACE`
or recycle the index. It wipes every namespace under the index, so use it
only when you specifically mean to.

Expected output:

```txt
RAG corpus: 429 chunks
Corpus hash: <sha256>
Upstash embed model: openai/text-embedding-3-small (1536d, server-side)
Vector namespace: portfolio-rag
Reset: Success                              # only when --reset (or --reset-all)
Upsert: 429/429

Upstash upsert: complete
```

The script does **not** print an "Embedding: complete" line — Upstash
embeds server-side during upsert, so there is no separate embedding loop to
audit. The chunk counts come from `--dry-run`.

## Why `--reset` (and what changes get re-embedded)

Upstash caches vectors by chunk id. The reindex script's chunk ids are
content-hashed (`sha256(text).slice(0, 12)` plus the source-path, kind, and
slug). Re-running the reindex **without** `--reset`:

- A new project / blog post / corpus section → new chunk text → new id →
  new embedding on Upsert. Other vectors re-used.
- An edited project's `notes` → changed chunk text → new id → new embedding.
  The old id stays in the index as a stale vector until you pass `--reset`.
- An untouched chunk → identical id → vector re-used, metadata refreshed.

`--reset` makes every production deploy a clean slate: the namespace is
emptied, then the new corpus is upserted in one pass. For ~430 chunks the
re-embedding cost is negligible and the cleanliness is worth it.

## Smoke Tests

Local:

```txt
pnpm dev
```

Then test:

- `/` loads with static mode selected.
- Static command chips behave exactly as before.
- Switching to dynamic shows `$ mehboob@portfolio-bastion:`.
- Each dynamic chip streams a response.
- Fireworks chat requests use `https://api.fireworks.ai/inference/v1`.
- Fireworks requests omit `reasoning_effort`, `thinking`, and
  `reasoning_content` handling.
- Clearing output aborts any active stream.
- Switching back to static does not call `/api/rag`.

API checks:

```txt
curl -sS -X POST http://localhost:3000/api/rag \
  -H 'content-type: application/json' \
  -d '{"command":"projects","question":"What should I look at first?"}'
```

Invalid payload should return `400`. Missing env vars should return `503`.

## Deployment Checklist

- Env vars set in Vercel.
- `pnpm rag:reindex -- --reset` run against the production Upstash index.
  `--reset` wipes the `portfolio-rag` namespace first so stale chunks
  don't accumulate across deploys.
- Vercel redeployed after env var setup.
- Six dynamic commands tested on preview.
- Static mode still works if `/api/rag` fails.
- No OpenAI or Upstash packages appear in the client bundle.
- No console errors on the landing page.

## Debugging

### Dynamic mode says not configured

Check:

- `LLM_PROVIDER` is set. Default should be `fireworks`.
- The matching provider key exists:
  - `fireworks` → `FIREWORKS_API_KEY`
  - `gemini` → `GEMINI_API_KEY`
  - `groq` → `GROQ_API_KEY`
  - `openai` → `OPENAI_API_KEY`
- `UPSTASH_VECTOR_REST_URL` exists.
- `UPSTASH_VECTOR_REST_TOKEN` exists.
- `RAG_UPSTASH_EMBEDDING_MODEL` and `RAG_UPSTASH_EMBEDDING_DIMENSIONS` match
  what was selected at Upstash index creation.
- Vercel was redeployed after adding env vars.

### Fireworks returns 404 for embeddings

The requested embedding model is:

```txt
accounts/fireworks/models/qwen3-embedding-8b
```

The Fireworks embedding docs also list:

```txt
fireworks/qwen3-embedding-8b
```

If the requested account-scoped model returns `404`, switch only
`RAG_EMBEDDING_MODEL` to the shorter model id and record the decision in the
active progress file.

### Answers are too generic

Likely causes:

- Corpus chunks are too thin.
- `docs/rag/corpus/` notes are missing.
- Retrieval `topK` is too low.
- Command question is too broad.

Fix:

- Add richer project and hiring notes.
- Reindex.
- Inspect retrieved chunk titles in server logs during preview only.

### Answers invent details

Likely causes:

- System prompt is too permissive.
- Retrieved context includes ambiguous wording.
- User-authored corpus notes include uncertain claims without caveats.

Fix:

- Strengthen "answer only from context" prompt.
- Add `private-boundaries.md`.
- Mark inferred or non-public details as not public.

### Reindex costs too much

Likely causes:

- Hash skip is not working.
- Markdown corpus contains large repeated sections.
- Script embeds unchanged chunks every run.

Fix:

- Verify corpus hash marker.
- Store per-chunk hashes.
- Add `--dry-run` output before embedding.

## Logging Policy

Production logs should not store full visitor questions by default. If debugging
requires query logging, log only:

- command key
- response status
- latency
- number of retrieved chunks
- retrieval titles, if safe

Do not log API keys, full model prompts, private corpus text, or contact-form
content.

## Rollback

If dynamic mode misbehaves:

1. Hide or disable the dynamic toggle in `HeroTerminal`.
2. Keep static mode as default and only visible mode.
3. Leave `/api/rag` deployed if harmless, or return `503`.
4. Re-enable after corpus or service issue is fixed.

Static mode is the fallback path and must remain independent.

## Security

- `UPSTASH_VECTOR_REST_TOKEN` is a **secret**. Never commit. Never
  paste into chat / screenshots / logs. The Upstash console's "Reset
  Token" button regenerates it instantly; the old token becomes
  invalid immediately.
- If the token surfaces in the wrong place (git diff, terminal
  scrollback pasted into a doc, screenshot), regenerate it in the
  Upstash console and update `.env.local` + Vercel env vars before the
  next deploy. Verify with `pnpm rag:reindex` after each rotation.
- The route and reindex script must **never** log the token or the
  full `UPSTASH_VECTOR_REST_URL`. `scripts/rag-reindex.ts` redacts the
  URL to `https://***-us1-vector.upstash.io` before printing it.

## Provider-Dashboard Caveats

- Fireworks' usage/analytics dashboard counts requests that reach
  Fireworks. **It does not count** pre-server timeouts, client-side
  retries that fail before the API receives the request, or network
  failures between the app and the API. If our route logs show errors
  but the dashboard looks healthy, the bug is in our `timeout` /
  `maxRetries` / network config — not on Fireworks' side.
- Upstash Vector's free-tier quota is **10k queries/day**. Reindex
  batches 20 chunks per request, so a 385-chunk reindex is ~20 REST
  calls plus one `info()` call. Real production traffic is bounded by
  the rate limit (default 20/IP/hour).

## Tuning Notes

- `temperature` is currently pinned to `0.2` in
  `lib/rag/providers.ts:streamChat()`. Fireworks also auto-pulls
  `temperature` from each model's `generation_config.json` when unset.
  If dynamic-mode answers feel too flat, swap the pinned value to
  `undefined` and let the model default surface.
- `max_tokens` is pinned at `500`. The `<= 80 words` system prompt
  doesn't need much headroom; raising this only helps if a question
  drags the model past 500 tokens.
- The route's per-IP rate limit (default 20/hour, configurable via
  `RAG_RATE_LIMIT_PER_HOUR`) is in-memory. It resets on cold start
  and is not shared across Vercel cold starts — so a single visitor
  on a long session can get more than 20 requests/hour via a restart.
  Acceptable for v1; tighten with Upstash Redis later.

## Manual QA Checklist

- Static mode works after hard reload (`Cmd+Shift+R`).
- Dynamic mode idle prompt renders `$ mehboob@portfolio-bastion: █`.
- Each of the six chips streams a response in dynamic mode
  (`whoami` / `projects` / `stack` / `latest` / `contact` / `help`).
- Press Esc mid-stream → the stream aborts, the body resets to idle.
- Click `[static]` mid-stream → same reset behavior, no `/api/rag`
  call on subsequent static chip clicks.
- Remove `FIREWORKS_API_KEY` from `.env.local`, restart `pnpm dev`,
  click a dynamic chip → friendly terminal text reading
  "Chat provider is not configured." or similar.
- Open DevTools → Network. Hit `/api/rag` and watch the panel: the
  request shows `content-type: text/plain; charset=utf-8` and
  streams chunks, not a single JSON blob.
- No hydration warnings in the browser console.
- No references to `upstash` or `fireworks` in DevTools → Sources
  → Page.
