# RAG Terminal — Upgrade Runbook

> **Audience:** Future agent session or the portfolio owner.
> **Purpose:** Document the v2 upgrade path from the static HeroTerminal (or keep static and add the dynamic rag based if requested)
> (shipped in Phase 7 T7.6) to a real LLM-backed chat that "knows about me"
> via retrieval-augmented generation over the portfolio content.
>
> **Status:** Implemented (Phase 33 + Phase 34). The dynamic mode is the
> v2 described here, the corpus is in production, and `pnpm rag:reindex`
> ships the content to Upstash. See [`docs/rag/rag-management.md`](rag/rag-management.md)
> for command-level docs (the three modes, when to run which, edit
> scenarios, deploy loop). The v1 static terminal is still live and
> is the default on every page load.

---

## Why RAG

The portfolio's hero terminal currently ships in **static mode**: 6 clickable
chips (`whoami` / `projects` / `stack` / `latest` / `contact` / `help`) that
surface pre-canned payloads. The chip → payload contract is **forward-compatible**
with a real LLM: replacing `buildPayload()` with a fetch to an LLM API keeps
the visual shell (`TerminalBlock` + chip row + typewriter) intact.

**The v2 outcome:** a visitor types or clicks a prompt, the backend queries
an LLM grounded in the portfolio's actual content (projects, experience,
blog posts) and streams a response into the same typewriter block. The
terminal becomes a real way to learn about Mahboob without leaving the
landing page.

## Proposed stack

| Layer | Choice | Why |
|---|---|---|
| Provider toggle | `LLM_PROVIDER=fireworks` default | Lets the implementation switch later to `gemini`, `groq`, or `openai` without rewriting the terminal route. |
| LLM | Fireworks OpenAI-compatible API | Mahboob has Fireworks credits; default model: `accounts/fireworks/models/gpt-oss-120b`. Chat only — no embeddings. |
| Embeddings | Upstash Vector built-in (server-side) | The application never calls an embeddings SDK. Default: `openai/text-embedding-3-small`, 1536 dims, server-side. |
| Vector store | Upstash Vector | Serverless, free tier, Vercel-friendly, REST API. No infra. Embeds and stores in one call. |
| Streaming | OpenAI-compatible streaming | Fireworks supports streaming chat completions; client reads the streamed text into `<HeroTerminal>`. |
| Chunker | Local TypeScript script (`scripts/rag-reindex.ts`) | Reads `data/projects.ts` + `data/experience.ts` + `data/blog.ts` + `docs/rag/corpus/*.md`, emits chunks; Upstash embeds them on upsert. |

The provider contract is now expanded in `docs/rag/PROVIDERS.md`.

## New env vars

Added to `.env.example` in T7.7:

```
LLM_PROVIDER=fireworks           # fireworks | gemini | groq | openai
FIREWORKS_API_KEY=               # required when LLM_PROVIDER=fireworks (chat only)
GEMINI_API_KEY=                  # required when LLM_PROVIDER=gemini
GROQ_API_KEY=                    # required when LLM_PROVIDER=groq
OPENAI_API_KEY=                  # required when LLM_PROVIDER=openai (chat only — not used for embeddings)
RAG_CHAT_MODEL=accounts/fireworks/models/gpt-oss-120b
RAG_UPSTASH_EMBEDDING_MODEL=openai/text-embedding-3-small   # must match Upstash index creation
RAG_UPSTASH_EMBEDDING_DIMENSIONS=1536                      # index is dimension-locked
UPSTASH_VECTOR_REST_URL=         # console.upstash.com → Vector
UPSTASH_VECTOR_REST_TOKEN=       # same — secret; never commit
```

Set them in **Vercel** → Project Settings → Environment Variables →
Production (and optionally Preview). Also add to local `.env.local` if
you want to test the RAG path during `pnpm dev`.

## New deps (server-only)

```
pnpm add openai @upstash/vector
```

All server-only — zero client bundle impact. The `openai` package is used as
the reusable OpenAI-compatible client for Fireworks first, then OpenAI/Groq
later. Gemini can be added behind the same provider adapter when needed.

## API route — `app/api/rag/route.ts`

```ts
import { Index } from "@upstash/vector";
import { getRagModelClient } from "@/lib/rag/providers";
import "server-only";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export const runtime = "nodejs"; // need Node 22 for full SDK support

export async function POST(req: Request) {
  const { question } = await req.json();
  if (typeof question !== "string" || question.length > 500) {
    return new Response("Bad request", { status: 400 });
  }

  // 1. Vector search. Upstash embeds the question server-side using the model
  //    selected at index creation (default openai/text-embedding-3-small, 1536d).
  //    The route does not call any embeddings SDK.
  const results = await index.query({
    data: question,
    topK: 5,
    includeMetadata: true,
  });

  // 2. Build context.
  const context = results
    .map((r) => `[${r.metadata!.kind}] ${r.metadata!.title}: ${r.metadata!.text}`)
    .join("\n\n");

  // 3. Stream the answer through the configured chat provider (Fireworks by default).
  const modelClient = getRagModelClient();
  return modelClient.streamChat([
    {
      role: "system",
      content: `You are Mahboob Alam's portfolio assistant. Answer questions using ONLY the context below. Be concise (3-6 sentences). If the context doesn't contain the answer, say "I don't have that info — check /lets-connect."\n\n---\n\n${context}`,
    },
    { role: "user", content: question },
  ]);
}
```

(`r.metadata.kind` is `"project"` / `"experience"` / `"blog"` so the
LLM can attribute its answers.)

## Reindex script — `scripts/rag-reindex.ts`

```ts
/**
 * Reads every entry from data/{projects,experience,blog}.ts and the
 * docs/rag/corpus/ notes, then upserts to Upstash Vector.
 *
 * Run: pnpm rag:reindex
 *   (requires UPSTASH_VECTOR_REST_URL + UPSTASH_VECTOR_REST_TOKEN;
 *    no provider key needed — Upstash embeds server-side.)
 *
 * Idempotent: each chunk id is stable for its source content.
 * Re-running overwrites the same id.
 *
 * The script does NOT call any embeddings SDK. Upstash embeds each
 * chunk on upsert using the model selected at index creation.
 */
import { Index } from "@upstash/vector";
import { buildRagCorpus } from "../lib/rag/chunks";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

const corpus = await buildRagCorpus();
// …upsert each chunk with `data: chunk.text` — Upstash handles embedding
```

`package.json` script:
```
"rag:reindex": "tsx scripts/rag-reindex.ts"
```

The script runs locally on demand and again as part of CI on content
hash change (Phase 8+).

## Swap path in HeroTerminal

The v1 static chip handlers live in `buildPayload()`. v2 replaces the
switch with a single fetch:

```ts
async function runCommand(key: ChipKey) {
  setActiveKey(key);
  setTyped(""); // typewriter starts fresh
  const resp = await fetch("/api/rag", {
    method: "POST",
    body: JSON.stringify({ question: helpBlurb(key) }),
  });
  if (!resp.body) { setTyped("Error: empty response"); return; }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    setTyped(acc); // typewriter becomes a streaming render
  }
}
```

Replace the `useEffect`-based typewriter with the streaming reader. The
`<pre>` block continues to render the typed text. The `█` cursor stays
the same; remove it (or keep it) based on feel.

The 6 chip keys continue to work — they become the question `prompt`s
passed to the LLM. The chip → URL pathway (`/lets-connect`) stays
intact for the `contact` chip.

## Content-hash reindex

Every reindex embeds the entire content corpus. To avoid surprise
costs:

1. Compute `sha256(contentBundle)` at reindex start.
2. Store the hash in Upstash Vector metadata under a `meta-hash`
   singleton.
3. Skip reindex if the hash matches.

Cheap insurance; recommended once we're past v1 launch.

## Cost analysis

```
Per query:
  Embeddings:      provider-dependent
  LLM:             provider-dependent
  Vector query:    free      (Upstash free tier: 10k queries/day)
  ─────────────────────────────────
  Total per query: depends on selected model/provider

At ~100 portfolio queries/month:
  Monthly cost: expected to remain low, but verify against Fireworks pricing
```

Negligible. The upgrade pays for itself the first time a visitor spends
30 seconds interacting with the hero.

## Open questions to decide before v2 ships

1. **Streaming vs. batch.** Streaming feels more dynamic but adds
   client complexity (read response stream → setTyped incrementally).
   Batch is simpler but feels slower. **Recommend streaming.**
2. **Question source.** Continue with clickable chips only, OR allow
   freeform text input in addition? Freeform is more open-ended but
   requires a `<form>` with input — adds UI surface area. **Recommend
   chips-only for v2**; freeform in v3.
3. **What about abuse?** A rate limit (5 queries / IP / hour via
   Vercel Edge Middleware) costs one extra runtime invocation per
   request. Cheap; should ship from v2 day 1.
4. **Caching.** Identical questions from different visitors should
   hit the cache. Add a query-string hash + Upstash Redis for
   1-hour TTL. Or skip — the cost is already negligible.
5. **Provider fallback.** Fireworks is the default. Later providers
   should be selected only through `LLM_PROVIDER` and the matching
   env key (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`).

## Rollout checklist (final — Phase 33 ships)

- [x] Fireworks + Upstash accounts created
- [x] `LLM_PROVIDER`, `FIREWORKS_API_KEY`, `UPSTASH_VECTOR_REST_URL`,
      `UPSTASH_VECTOR_REST_TOKEN`, `RAG_UPSTASH_EMBEDDING_MODEL`,
      `RAG_UPSTASH_EMBEDDING_DIMENSIONS` in `.env.example`
- [x] `pnpm add openai @upstash/vector`
- [x] `pnpm rag:reindex` populates the vector store (verify with the
      Upstash console under `portfolio-rag` namespace)
- [x] `app/api/rag/route.ts` implemented
- [x] `HeroTerminal.tsx` has the static/dynamic toggle + streaming fetch
- [x] `lib/rag/rate-limit.ts` enforces 20/IP/30 mins (`RAG_RATE_LIMIT_PER_THIRTY_MINUTES`
      to override)
- [x] `docs/rag/corpus/voice.md` + `system-prompt.md` indexed as
      retrievable chunks; the route concatenates them into the system
      message at request time
- [ ] **Local**: add real `FIREWORKS_API_KEY` + Upstash vars to
      `.env.local`, run `pnpm rag:reindex`, `pnpm dev`, click each of
      the six chips in `[dynamic]` mode, verify streamed answers
- [ ] **Vercel**: add the same env vars to Production (and Preview if
      you want pre-release smoke). Redeploy.
- [ ] Confirm Lighthouse still passes 96+ a11y, 100 SEO on `/`

## Notes

- The `Server-Component` TerminalBlock wrapper remains. Only the
  client-state in `HeroTerminal.tsx` changed.
- The vite-style `dynamic({ ssr: false })` boundary is NOT needed for
  the RAG version — the static chip handlers were the only thing
  requiring `'use client'`, and the streaming fetch keeps that.
- `openai` and `@upstash/vector` stay server-side because the route
  uses `await import("@/lib/rag/providers")` — verified by a `pnpm
  build` + grep for `upstash` / `fireworks` in `.next/static/chunks`
  (zero matches).
- The dynamic route returns `503` with a plain-text body when env vars
  are missing. The HeroTerminal renders that text in muted terminal
  style. Static mode is unaffected.
- Per-IP rate limit is in-memory and resets on cold start. When the
  portfolio gets Upstash Redis or Vercel KV, swap
  `lib/rag/rate-limit.ts`'s `Map` for a shared store; the route stays
  the same.
