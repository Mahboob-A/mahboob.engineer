# RAG Terminal Operations

**Purpose:** Day-to-day setup, reindexing, deployment, and debugging notes for
the dynamic hero terminal.

## Required Services

1. Fireworks API key for the first chat + embeddings implementation.
2. Upstash Vector index.
3. Vercel environment variables for production and preview.

Recommended Upstash Vector settings:

- Dimension: match Fireworks `qwen3-embedding-8b` output. If using the
  `dimensions` request parameter later, match that configured value exactly.
- Distance metric: cosine.
- Region: closest reasonable region to Vercel deployment.

## Environment Variables

Local `.env.local`:

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

Vercel:

- Add all three variables to Production.
- Add all three to Preview if dynamic mode should be tested before release.
- Redeploy after adding or changing variables.

## Reindex Flow

Run after changing:

- `data/projects.ts`
- `data/experience.ts`
- `data/blog.ts`
- `data/stack.ts`
- `docs/rag/corpus/*.md`

Command:

```txt
pnpm rag:reindex
```

Expected output:

```txt
RAG corpus: 64 chunks
Corpus hash: <sha256>
Embedding: complete
Upstash upsert: complete
Index status: ready
```

The script should skip when the corpus hash has not changed.

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
- Fireworks requests use `https://api.fireworks.ai/inference/v1`.
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
- `pnpm rag:reindex` run against the production Upstash index.
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
