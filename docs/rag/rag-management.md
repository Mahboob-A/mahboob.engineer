# RAG Corpus Management

> What `pnpm rag:reindex` actually does, when to run it, and how Upstash
> embedding caching decides which chunks re-embed.
>
> Reader: anyone editing the corpus registries (`data/*.ts`) or the
> personal fill-in files (`docs/rag/corpus/*.md`), or running a
> production deploy that needs the dynamic HeroTerminal to pick up new
> content.
>
> Companion to [`OPERATIONS.md`](./OPERATIONS.md), which is organized
> by topic (env, debug, security). This doc is organized by command.

## TL;DR

| Command | When to run it | What it does to the index |
|---|---|---|
| `pnpm rag:reindex -- --dry-run` | Locally, before any real reindex | Prints chunk counts by kind and shows 5 sample chunks. No network calls. |
| `pnpm rag:reindex -- --reset` | Every production deploy, or any time stale chunks need clearing | Wipes the `portfolio-rag` namespace, then upserts every chunk fresh. |
| `pnpm rag:reindex -- --reset-all` | Rare: when the namespace name changes or the index is recycled | Wipes every namespace under the index, then upserts fresh. |
| `pnpm rag:reindex` (no flag) | Local dev only — you usually want `--dry-run` | Additive upsert: reuses cached vectors, re-embeds only new or changed chunks. |

## What `pnpm rag:reindex` actually does

The script has three phases. It takes a few seconds end-to-end against
the real Upstash index.

### Phase 1 — Build the corpus (always runs)

`lib/rag/chunks.ts:buildRagCorpus()` reads the entire corpus:

- Every `data/*.ts` registry (`projects`, `experience`, `education`,
  `blog`, `stack`, `contact`, plus the FAQ / key-achievement /
  now-status exports).
- Every `.md` / `.mdx` / `.txt` file under `docs/`, `content/`, and
  `docs/rag/corpus/`.
- Splits by `##` heading where it makes sense; clamps large doc chunks
  to 250 words (per T33.5d's "tighter retrieval" pass).
- Deduplicates by chunk id.

The output is a `RagCorpus` of `{ chunks: RagChunk[]; hash: string }`.
`hash` is `sha256` of every chunk's `(id, text, metadata)` — useful as
a "did the corpus change at all" guard, though the per-chunk id is
what actually drives the caching.

### Phase 2 — Assign stable chunk ids

Each chunk gets a deterministic id built from its content:

```ts
// lib/rag/chunks.ts
function stableId(kind, sourcePath, key, text) {
  const digest = createHash("sha256").update(text).digest("hex").slice(0, 12);
  return `${kind}:${slugify(sourcePath)}:${slugify(key)}:${digest}`;
}
```

Change any byte of `text` and the `digest` changes, so the id
changes, so Upstash treats it as a brand-new vector.

### Phase 3 — Upsert to Upstash (skipped with `--dry-run`)

The script batches up to 20 chunks per request and calls
`index.upsert({ id, data: text, metadata })` against Upstash. Upstash
runs `openai/text-embedding-3-small` (or whatever model
`RAG_UPSTASH_EMBEDDING_MODEL` says, default at index creation) on
every **new** id; for existing ids it reuses the cached vector and
just refreshes the metadata.

## The three flag modes

### `--dry-run`

Local-only sanity check. Runs the aggregator, prints the chunk
counts by kind, and shows the first 5 chunks with their id, kind,
title, and the first 180 characters of the text. No network calls
at all — it exits before reading any `UPSTASH_VECTOR_REST_*` env
vars. Use this any time you're about to run a real reindex and
want to preview what would change.

```sh
$ pnpm rag:reindex -- --dry-run
RAG corpus: 429 chunks
Corpus hash: <sha256>
By kind:
  blog             58
  boundary         5
  contact          1
  doc              277
  ...
Dry run: no embeddings or Upstash writes.

- project:data-projects-ts:taply:95d64283b945
  project: Taply — first-person overview
  What it is: Digital business card platform. NFC, QR, analytics, ...
```

### `--reset`

Wipes the `portfolio-rag` namespace via `index.reset()` **before**
the upsert loop runs. That way:

- Orphan vectors (chunks that were deleted, renamed, or whose text
  changed enough to swap ids) get dropped from the index.
- Every remaining chunk gets a fresh embedding.
- The namespace is always exactly the current corpus.

Cost is fractions of a cent per run for the current ~429 chunks
(Upstash proxies `text-embedding-3-small`, the model you selected
at index creation). Use `--reset` on every production deploy and
any time you've deleted or renamed entries locally.

The script's order is dim-check → `--reset` → upsert, so a
dimension mismatch still throws before any wipe happens. Don't
fall for the temptation to skip the dim check.

### `--reset-all`

Wipes **every** namespace under the index via
`client.reset({ all: true })`. Almost never what you want. Use it
only when:

- You renamed `RAG_VECTOR_NAMESPACE` and want to drop the old
  namespace's vectors.
- You're recycling the index for a different purpose.
- You genuinely want a clean slate across everything.

Passing both `--reset` and `--reset-all` is rejected with a clear
error before any network call.

## When does Upstash re-embed vs reuse?

`upsert({ id, data, metadata })` is the only call the script makes.
Upstash's behaviour by id:

| Scenario in our script | What Upstash does | Embedding cost |
|---|---|---|
| Chunk text unchanged → same id | Vector cache hit. Metadata refreshed. | **0** |
| Chunk text changed → new id (old id persists unless `--reset`) | Brand-new embedding for the new text. The old vector stays at the old id until reset. | **1** per changed chunk |
| New chunk (new project / section / blog post) → new id | Fresh embedding. | **1** per new chunk |
| `--reset` → namespace is empty before any upsert | Every chunk looks new. | **~429** (one per chunk) |
| `--reset-all` → index namespaces empty | Same as `--reset`. | **~429** |

There's no "same id, different text" path in practice from our
end — `stableId()` always recomputes the digest from the current
text, so any edit produces a new id.

The cache key is the chunk id, and the chunk id is content-hashed.
That's what makes the cheap local-iteration path work without
`--reset`: editing one section of `bio.md` re-embeds just the
section's chunk, everything else reuses cached vectors for free.

## Edit scenarios

| Edit | Re-run needed? | Command |
|---|---|---|
| Tweak a paragraph in `docs/rag/corpus/bio.md` (any prose under any `##`) | Yes — that section's chunk gets a new id and re-embeds | `pnpm rag:reindex -- --reset` on prod, `--dry-run` is fine locally to preview |
| Add a new project to `data/projects.ts` | Yes — two new chunks (overview + architecture), two new embeddings | Same |
| Edit one project's `notes` field | Yes — the architecture chunk's text changes → new id → new embedding. The overview chunk's text didn't change → reuses. | Same |
| Add a new blog post to `data/blog.ts` | Yes — four new chunks (About / Why / Personal take / Takeaway when `notes` is present) | Same |
| Add a new `### post title` sub-heading to `docs/rag/corpus/writing-notes.md` | Yes — one new chunk | Same |
| Add a new `depthNotes` to an existing stack item | Yes — that item's stack chunk's text grows | Same |
| Add a new dependency to `package.json`, change a TypeScript type, refactor a component | **No** — the corpus didn't change. Run the regular `pnpm build` to confirm. | None |
| Delete a project / experience / blog post / corpus section | Yes (with `--reset`) — without it the orphan vector sits in the index until you reset, polluting retrieval | `pnpm rag:reindex -- --reset` |
| Rename a chunk's title or slug | Same as delete — old id stays in the index. Always reset on rename. | `pnpm rag:reindex -- --reset` |
| Switch `LLM_PROVIDER`, swap Fireworks to Groq, change chat model | No — provider config is runtime-only, the corpus stays the same. The route resolves the provider per request. | None |
| Add or change `RAG_UPSTASH_EMBEDDING_MODEL` / `RAG_UPSTASH_EMBEDDING_DIMENSIONS` | **Yes, and recreate the Upstash index first.** The new dimension must match the model and the index must be recreated at that dimension. The script's dim-check guards against a mismatch. | Reset after recreating |

## Production deploy loop

The minimum sequence that updates the dynamic HeroTerminal with new
corpus content:

1. **Edit.** Change the registry or the markdown file. Commit
   locally per the rulebook (one task per commit, typecheck-clean).
2. **Preview locally.** `pnpm rag:reindex -- --dry-run` to see the
   new chunk counts and a sample of changed chunks.
3. **Reindex production.** Once with `--reset`, against the
   production env vars. From your laptop, from CI, or via the Vercel
   CLI — whichever is convenient. Takes seconds; costs fractions of
   a cent.
   ```sh
   pnpm rag:reindex -- --reset
   ```
4. **Redeploy if app code changed.** Only needed when the route,
   the chunker, the provider adapter, or the HeroTerminal itself
   changed. Pure content edits don't need a Vercel redeploy —
   the route is dynamic (`runtime = "nodejs"`,
   `dynamic = "force-dynamic"`) and queries the corpus at request
   time.
5. **Smoke the chips.** Hit each of the six chips in `[dynamic]`
   mode and read the first answer. If anything reads wrong, the
   corpus chunk is the first place to look — open the
   Upstash console, find the chunk's id (it's in the script's
   output), and inspect the metadata + text the route retrieved.

## Why production defaults to `--reset`

Cost analysis:

| Mode | Embedding cost per run | Stale-vector risk |
|---|---|---|
| `--dry-run` | 0 | 0 (no network calls) |
| Additive (no flag) | 1 per changed chunk | Vector orphans accumulate over many deploys |
| `--reset` | ~429 (full re-embed every time) | 0 |

At ~429 chunks and fractions of a cent per embedding, full reset
costs roughly the same as a single deploy's worth of bundle
size. The cleanliness guarantee is worth more than saving
~0.001 dollars per deploy. Use `--reset` on every production
deploy.

## When to reach for `--reset-all`

The escape hatch is for genuine namespace lifecycle events:

- You're renaming `RAG_VECTOR_NAMESPACE` from `portfolio-rag` to
  something else. Run once with `--reset-all` to drop the old
  namespace's vectors in one go, then the new namespace fills up
  on the next upsert.
- You're recycling the Upstash index for a different product and
  want to clear everything.

For any other concern, `--reset` is enough.

## Where it lands in the file tree

| Path | What |
|---|---|
| `lib/rag/chunks.ts` | The aggregator. Touch when the chunking strategy, kinds, or per-chunk metadata shape changes. |
| `scripts/rag-reindex.ts` | The CLI. Touch when adding a flag or changing the batch size. |
| `docs/rag/OPERATIONS.md` | Topic-organized reference: env, debug, security, tuning. |
| `docs/rag/ARCHITECTURE.md` | Product shape and runtime boundaries. |
| `docs/rag/PROVIDERS.md` | Chat-provider and embedding configuration. |
| `docs/RAG_TERMINAL.md` | The original (Phase 7) runbook; updated for the final shipped shape. |
| `progress/work-progress-p33.md` | Phase 33 implementation narrative. |
| `progress/work-progress-p34.md` | Phase 34 corpus enrichment + the `--reset` flag. |

## Notes for future work

- The script doesn't currently compare `corpus.hash` against a
  persisted "last indexed hash" and skip when unchanged. The
  current "always upsert all" approach is fine at ~429 chunks but
  would benefit from a skip-when-unchanged path at scale.
- Chunk count is small enough that `--reset` is cheap. If the
  portfolio grows past ~10k chunks, revisit whether a smart diff
  (delete-only-the-orphans) is worth the complexity.
- No automated smoke test exists that runs against the real
  Upstash index. The dim-check + manual chip smoke in
  `docs/rag/OPERATIONS.md` is the current QA surface.
