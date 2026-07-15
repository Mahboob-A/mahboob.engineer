# RAG Terminal — Upgrade Runbook

> **Audience:** Future agent session or the portfolio owner.
> **Purpose:** Document the v2 upgrade path from the static HeroTerminal
> (shipped in Phase 7 T7.6) to a real LLM-backed chat that "knows about me"
> via retrieval-augmented generation over the portfolio content.
>
> **Status:** Not implemented. This runbook documents the swap path; the
> v1 static terminal is live and serves users correctly. v2 is a future
> task with the prerequisite env vars added to `.env.example` (T7.7).

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
| LLM | OpenAI `gpt-4o-mini` via Vercel AI SDK | Cheap (~$0.10/1k queries), good enough for RAG, well-supported. |
| Embeddings | OpenAI `text-embedding-3-small` | Same vendor (one API key), 1536 dimensions, cheap. |
| Vector store | Upstash Vector | Serverless, free tier, Vercel-friendly, REST API. No infra. |
| Streaming | Vercel AI SDK `streamText()` | Built-in SSE streaming; integrates with the `<HeroTerminal>` typewriter. |
| Chunker | Local Node script (`scripts/rag-reindex.mjs`) | Reads `data/projects.ts` + `data/experience.ts` + `data/blog.ts`, emits chunks with metadata. |

The combo keeps everything in TS, deploys as Vercel functions, costs
~$0.01/mo at portfolio traffic (100 queries × $0.0001 = $0.01).

## New env vars

Added to `.env.example` in T7.7:

```
OPENAI_API_KEY=                  # platform.openai.com/api-keys
UPSTASH_VECTOR_REST_URL=         # console.upstash.com → Vector
UPSTASH_VECTOR_REST_TOKEN=       # same
```

Set them in **Vercel** → Project Settings → Environment Variables →
Production (and optionally Preview). Also add to local `.env.local` if
you want to test the RAG path during `pnpm dev`.

## New deps (server-only)

```
pnpm add ai @ai-sdk/openai @upstash/vector
```

All server-only — zero client bundle impact. Roughly 80 KB minified in
the server bundle. (`ai` is the Vercel AI SDK; pulls in zod for
validation.)

## API route — `app/api/rag/route.ts`

```ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Index } from "@upstash/vector";
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

  // 1. Embed the question.
  const embedResp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const queryVector = embedResp.data[0].embedding;

  // 2. Top-5 from the vector store.
  const results = await index.query({ vector: queryVector, topK: 5, includeMetadata: true });

  // 3. Build context.
  const context = results
    .map((r) => `[${r.metadata!.kind}] ${r.metadata!.title}: ${r.metadata!.text}`)
    .join("\n\n");

  // 4. Stream the answer.
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are Mahboob Alam's portfolio assistant. Answer questions using ONLY the context below. Be concise (3-6 sentences). If the context doesn't contain the answer, say "I don't have that info — check /contact."\n\n---\n\n${context}`,
    prompt: question,
  });
  return result.toDataStreamResponse();
}
```

(`r.metadata.kind` is `"project"` / `"experience"` / `"blog"` so the
LLM can attribute its answers.)

## Reindex script — `scripts/rag-reindex.mjs`

```js
#!/usr/bin/env node
/**
 * Reads every entry from data/{projects,experience,blog}.ts,
 * embeds via text-embedding-3-small, writes to Upstash Vector.
 *
 * Run: pnpm rag:reindex
 *   (requires OPENAI_API_KEY + UPSTASH_VECTOR_REST_URL + _TOKEN)
 *
 * Idempotent: tags each chunk with a content hash key. Re-running
 * overwrites the same key.
 */
import { Index } from "@upstash/vector";
import OpenAI from "openai";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});
const openai = new OpenAI();

// …read PROJECTS, EXPERIENCE, BLOG_POSTS, write chunks with metadata
```

`package.json` script:
```
"rag:reindex": "tsx scripts/rag-reindex.mjs"
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
  Embeddings:      $0.00002  (1 input × 3-small)
  LLM:             $0.00015  (300 in / 200 out × 4o-mini)
  Vector query:    free      (Upstash free tier: 10k queries/day)
  ─────────────────────────────────
  Total per query: ~$0.00017

At ~100 portfolio queries/month:
  Monthly cost: ~$0.017
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

## Rollout checklist

- [ ] OpenAI + Upstash accounts created
- [ ] `OPENAI_API_KEY`, `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN` in `.env.local`
- [ ] `pnpm add ai @ai-sdk/openai @upstash/vector`
- [ ] `pnpm rag:reindex` populates the vector store (verify with `upstash` console)
- [ ] `app/api/rag/route.ts` implemented (snippet above)
- [ ] `HeroTerminal.tsx` swaps `buildPayload` for the streaming fetch
- [ ] Phase 8 deploy: env vars in Vercel, redeploy, smoke-test 6 chips
- [ ] Confirm Lighthouse still passes 96+ a11y, 100 SEO

## Notes

- The `Server-Component` TerminalBlock wrapper remains. Only the
  client-state in `HeroTerminal.tsx` changes.
- The vite-style `dynamic({ ssr: false })` boundary is NOT needed for
  the RAG version — the static chip handlers were the only thing
  requiring `'use client'`, and the streaming fetch keeps that.
- No new build output. No new routes. Server only. The portfolio's
  static / SEO story stays intact.
