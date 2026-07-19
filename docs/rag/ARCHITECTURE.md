# RAG Terminal Architecture

**Status:** Planned
**Landing surface:** `components/hero/HeroTerminal.tsx`
**Default mode:** static

This document defines the target architecture for adding a dynamic,
retrieval-backed terminal to the landing-page hero while keeping the current
static terminal intact.

## Product Shape

The hero terminal has two modes:

- `static` — the current implementation. Six command chips render deterministic
  local payloads from `data/*.ts`. This is the default on page load.
- `dynamic` — the same terminal shell and command chips call a backend RAG
  route. The answer is grounded in the portfolio corpus and streamed into the
  terminal output area.

The mode switch replaces the current terminal label text:

```txt
terminal  [static] [dynamic]
```

When `dynamic` is selected and no command has run yet, the body shows a blinking
prompt:

```txt
$ mehboob@portfolio-bastion:
```

The prompt should use existing token colors only: `text-acc` for the username
or host accent, `text-t2`/`text-t3` for muted shell syntax, and the existing
terminal cursor animation from `HeroTerminal.css`.

## High-Level Flow

```mermaid
flowchart LR
  A["Visitor clicks dynamic command"] --> B["HeroTerminal client component"]
  B --> C["POST /api/rag"]
  C --> D["Embed question"]
  D --> E["Vector search"]
  E --> F["Build grounded context"]
  F --> G["Stream concise answer"]
  G --> B
  B --> H["Terminal output"]
```

## Proposed Stack

| Layer | Choice | Notes |
|---|---|---|
| Chat model | OpenAI via Vercel AI SDK | Use a small low-latency model for concise answers. |
| Embeddings | OpenAI `text-embedding-3-small` | One embedding model for query + indexed chunks. |
| Vector store | Upstash Vector | Serverless, Vercel-friendly REST API. |
| Streaming | Vercel AI SDK `streamText()` | Server route streams text; client reads the response. |
| Indexer | Local script | Reads registries and docs, embeds chunks, upserts to vector store. |

## Runtime Boundaries

- `HeroTerminal.tsx` remains a Client Component because it owns terminal mode,
  active command, streaming output, and keyboard behavior.
- `app/api/rag/route.ts` is server-only and must import model/vector clients
  only inside the route boundary.
- No OpenAI or Upstash keys are exposed to the client.
- No browser storage is used. Static mode remains default on every load.
- No project, experience, or contact content is hardcoded in JSX. Static mode
  keeps reading from `data/*.ts`; dynamic mode reads from the indexed corpus.

## Route Contract

Request:

```json
{
  "command": "projects",
  "question": "What are Mahboob's strongest backend projects?"
}
```

Response:

- `200` streaming text when env vars and vector index are available.
- `400` for invalid command/question payloads.
- `503` with a short terminal-safe message when dynamic mode is not configured.

The client should gracefully render `503` responses as terminal output and
leave static mode untouched.

## Command Mapping

| Command | Dynamic question |
|---|---|
| `whoami` | "Summarize who Mahboob Alam is, what he is building, and what kind of roles fit him." |
| `projects` | "What are Mahboob's most relevant backend and platform projects?" |
| `stack` | "What technologies has Mahboob used in real projects, and where?" |
| `latest` | "What is Mahboob currently building or writing about?" |
| `contact` | "How can someone contact Mahboob and what should they contact him for?" |
| `help` | "Explain what this portfolio terminal can answer." |

## Grounding Rules

The system prompt must enforce:

- Answer only from retrieved context.
- Be concise: 3-6 sentences or short terminal-style bullets.
- Prefer concrete project names, roles, metrics, and links from the corpus.
- If context is missing, say so and point to `/lets-connect`.
- Do not invent dates, employers, metrics, private client names, or production
  claims.

## Failure Modes

| Failure | User-visible behavior |
|---|---|
| Missing env vars | Dynamic output says dynamic mode is not configured yet. |
| Vector query failure | Dynamic output asks the visitor to try static mode or `/lets-connect`. |
| Model timeout | Output stops with a short "request timed out" line. |
| Empty retrieval | Output says the corpus does not contain that answer. |

Static mode should never depend on any dynamic dependency or env var.
