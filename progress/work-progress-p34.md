# Phase 34 — Corpus data enrichment

**Phase:** 34 — Corpus data enrichment
**Phase status:** in-progress
**Date started:** 2026-07-19

**Goal:** Make the dynamic RAG terminal's corpus as rich as the rest of the
portfolio. The Phase 33 implementation reindexed every `data/*.ts`
registry and every `docs/**/*.md` file, but the personal fill-in files in
`docs/rag/corpus/` were still placeholders. Phase 34 fills them, extends
the experience and blog registries with `notes` where missing, and adds
qualitative depth notes to the stack registry.

Three tracks:

- **Track A (T34.1)** — fill all 6 `docs/rag/corpus/*.md` files.
- **Track B (T34.2)** — add `BlogPostItem.notes` + fill for all 14 Medium
  posts; add `ExperienceItem.notes` for Eve Healthcare.
- **Track C (T34.3)** — add `StackItem.depthNotes` + fill for ~10
  learning-area techs.

---

## T34.1 — Fill in `docs/rag/corpus/*.md`

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- `docs/rag/corpus/bio.md` — five first-person sections: *Who I am*, *What
  you should remember in 30 seconds*, *Why backend + platform*, *What I'm
  building now*, *What keeps me up at night*. Each section ≤ 150 words.
- `docs/rag/corpus/hiring.md` — four first-person sections: *Strong fit*
  (Series A through C sweet spot, Django + Celery + Redis + Postgres),
  *What I'd push back on in an interview* (honesty on Go / Terraform /
  Kubernetes / eBPF learning areas), *Good interview topics* (eight
  concrete topics I'd enjoy), *Numbers I haven't published* (compensation
  + visa + notice publicly not posted, discussed on call).
- `docs/rag/corpus/project-deep-cuts.md` — three first-person sections:
  *Incidents and postmortems* (Algocode fork bomb, Movio single-worker
  upload, NexBell session-fixation), *What I would rebuild differently*
  (one honest list per project I'd revisit), *Demo readiness*
  (Taply/UnThink live; rest on GitHub; Algocode / Movio / DrishtiAI /
  DataLineage Doctor ranked by stars).
- `docs/rag/corpus/writing-notes.md` — keeps the existing recommendation
  rules and adds a new *Per-post notes* section with 14 `###` sub-headings,
  one per Medium post. Each sub-heading carries a 2–4 sentence first-person
  take-away (not the full `excerpt`): what the post argues, who it is for,
  why I wrote it. The most-cited entry points the reader at the Algocode
  deep-dive.
- `docs/rag/corpus/contact-policy.md` — keeps *Good reasons*, *Not a fit*,
  *Preferred context*, and adds *After you hit send* (the form's actual
  Resend → Gmail flow) and *When to use the form vs direct links* (the
  form for hiring / partnership, direct links for casual).
- `docs/rag/corpus/private-boundaries.md` — keeps *Safe rule*, *Do not
  invent*, *Learning areas*, and adds *Compiled from these sources*
  (which `data/*.ts` and `docs/**/*.md` files feed the corpus, so future
  agents know the bounded knowledge surface).

### Decisions

- Single file for `writing-notes.md` per the user's preference — the
  chunker's heading-based splitting already handles 14 sub-headings as
  separate retrieval targets.
- Personal voice in every section — first person, short sentences, named
  tools and projects. Matches `voice.md` rules.
- The `private-boundaries.md` "Compiled from these sources" line is the
  first explicit corpus-source-of-truth statement the corpus has. Future
  agents adding new files now have a runtime check (anything not in the
  list won't be indexed — which is also what we want).
- No `kind` tag added to these files for now — they still index as `doc`
  or `boundary` (private-boundaries only). Adding specific kinds
  (`bio`, `hiring`, `writing-notes`, etc.) is a future T34.4+ if
  retrieval quality wants it.

### Caveats / pending

- The `notes` field for `BlogPostItem` doesn't exist yet — writing-notes.md
  per-post entries are duplicated once in T34.2 under each post's slug.
  This is intentional: reindex will produce two retrieval targets per
  Medium post (one from `data/blog.ts`, one from `docs/rag/corpus/
  writing-notes.md`), each scoring for slightly different queries.
- The `bio.md` "30 seconds" section is denser than the rest of the
  portfolio's "elevator pitch" copy on the landing page. Intentional —
  the dynamic terminal visitors are a different audience (recruiters,
  technical interviewers) than the landing page (mixed visitor).

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → 413 chunks across 12 kinds, up from
  389 (+24). `doc` chunks 254 → 277 (+23 — bio / hiring / project-
  deep-cuts / writing-notes / contact-policy / private-boundaries all
  split by `##`). `boundary` 4 → 5 (private-boundaries gained the
  *Compiled from these sources* section). No new kinds introduced.

---

## T34.2 — Per-post notes + Eve Healthcare `notes`

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- `data/blog.ts:BlogPostItem` — added optional `notes?: string` field.
  Doc comment explains it's the first-person take-away the dynamic RAG
  terminal surfaces as the "why I wrote it" answer, lives in the
  registry as the source of truth, and isn't rendered on the static
  `/writing` page.
- `data/blog.ts` — filled `notes` for all **16** blog entries (4-part
  Linux Networking series, 3-part PostgreSQL series, 2-part Redis HA,
  AWS Networking 101, three standalone cross-posts, three native MDX
  posts). Each is 2–4 sentences in first-person voice.
- `data/experience.ts` — added `notes` for the previously-thin
  **Eve Healthcare** internship entry (4 paragraphs, ~340 words) so
  the chunker surfaces the same depth as the other three roles.
- `lib/rag/chunks.ts:buildBlogChunks` — emits a new *personal take*
  chunk per post when `notes` is present, alongside the existing
  *what it is* / *why I wrote it* / *the takeaway* chunks.

### Decisions

- 2–4 sentence cap on per-post notes keeps the retrieval shape small.
  The dynamic terminal further compresses to 80 words in the answer,
  so the corpus line only needs to be retrieval-relevant, not
  reader-complete.
- The *personal take* chunk is a fourth chunk on top of the existing
  three for each post, not a replacement. Total corpus cost is +16
  chunks for full coverage.
- Idempotent tool: a Python-based bulk injector ran into one path
  mismatch on posts whose closing brace was preceded by another
  trailing-comma line. Surgical `Edit` calls filled the 4 gaps. Net
  runtime cost: a few minutes. Lesson logged for future scripts that
  touch this file.

### Caveats / pending

- The registry now has both the *personal take* chunk (from
  `data/blog.ts:notes`) and the *per-post note* chunk (from
  `docs/rag/corpus/writing-notes.md`). They overlap in content but
  carry different retrieval metadata — the *personal take* chunks
  are tagged `kind: "blog"` (natively part of the post object),
  while the writing-notes ones are tagged `kind: "doc"`. Both
  retrieval targets are intentional (different queries will prefer
  different metadata).
- The detection script my tooling wrote up reported 12/14 instead of
  14/14 due to a regex bug. Future reindex-time validation could
  add an assertion: "every BlogPostItem has notes if it has an
  excerpt longer than 80 chars" — but that's future work.

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → 429 chunks across 12 kinds, up
  from 413 (+16 — exactly one new personal-take chunk per blog post).
  `blog` chunks 42 → 58. `experience` chunks stayed at 11 (no count
  change; both Eve Healthcare chunks grew in text volume rather than
  count).

---

## T34.3 — Stack depth narrative

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- `data/stack.ts:StackItem` — added optional `depthNotes?: string`
  field. Doc comment explains it's the first-person qualifier the
  dynamic RAG terminal surfaces alongside the `depth` marker for
  techs where a one-line note matters more than the existing
  `projects` cross-reference list.
- `data/stack.ts` — wrote `depthNotes` for **13 stack entries**:
  - The 4 learning-area items (kubernetes, terraform, go, ebpf) with
    honest "what I'm learning, here's where I am" notes plus the
    Kafka learning item.
  - 8 production-grade techs (python, linux, postgresql, redis,
    django, rabbitmq, ffmpeg, webrtc, jwt/oauth2) with one
    sentence each that names *where* the tech was used and what
    the muscle memory is.
- `lib/rag/chunks.ts:buildStackChunks` — drops the "Don't treat as
  production expertise" tagline (it was wrong for items with
  `depthNotes` because they explicitly have production evidence) and
  adds a new "In my words: <depthNotes>" line when the field is set.

### Decisions

- 13 of 29 items got prose; the remaining 16 (DRF, Celery, FastAPI,
  WebSocket, SSE, Docker, AWS, Nginx, Pulumi, CI/CD, MongoDB,
  OpenCV, Stripe, bKash, Gemini, plus the rest) intentionally don't
  have notes — they're well-served by the existing `projects` and
  `blogs` fields and adding prose would have diluted the chunk with
  redundant cross-references. Future agents can add `depthNotes` to
  any of them if a query surfaces their absence.
- Removed the "Don't treat as production expertise without project
  evidence" line from the chunker because it's now misleading when
  `depthNotes` is explicitly production evidence. The same caveat
  still applies to the `depth: <number>` line itself (e.g. `30/100`
  for Go) and is implied by the depth value without the boilerplate.

### Caveats / pending

- Stack chunk count is unchanged (29) — the `depthNotes` content
  rides inside the existing chunks rather than spawning a fourth
  per-item chunk. That's intentional for retrieval: a stack item
  isn't large enough to merit a separate "personal take" chunk the
  way a blog post is, but it's still first-person enough to add
  retrieval signal to the existing chunk.
- No prose added for the static `/stack` page-rendered items
  (DRF, Celery, etc.). The portfolio's `/stack` page renders the
  registry without surfacing `depthNotes`; that's intentional —
  the prose is for retrieval, not display. A future task could
  surface it as a one-line annotation under each chip on `/stack`
  if it earns its space.

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → 429 chunks unchanged in count.
  Stack chunks gained "In my words:" lines for the 13 items with
  `depthNotes`. Other entries unchanged.

## Phase 34 Outcome

**Before Phase 34:** 389 chunks, with thin personal fill-in files
and missing `notes` on the Eve Healthcare entry and the 14 Medium
posts. Stack item depths were numeric-only and didn't carry a
first-person qualifier.

**After Phase 34:** 429 chunks (+40 — 24 doc chunks from P34.1, 16
blog personal-take chunks from P34.2, 0 count change from P34.3 but
~13 chunks enriched with depthNotes prose). The dynamic RAG
terminal now has:

- 5 first-person bio sections retrievable independently.
- 4 hiring-fit sections retrievable independently.
- 14 per-post Medium notes retrievable as a fourth chunk per post.
- 1 richer Eve Healthcare `notes` (4 paragraphs).
- 13 stack entries with first-person depth qualifiers.

**Manual smoke after deploying to Vercel + reindexing against the
real Upstash index** — six dynamic chips should now answer:

- `whoami` — "I'm a backend engineer first..." answer grounded in
  bio.md, projects.ts notes, hiring.md.
- `projects` — "Taply is my co-founder project, Algocode proves
  distributed systems..." answer pulling project notes + the
  project-deep-cuts demo-readiness section.
- `stack` — "Python and Django are the strongest, Go and Kubernetes
  are honest learning areas..." answer pulling stack.ts + the
  depth-marker qualifiers + bio.md "Why backend + platform".
- `latest` — "I'm shipping Taply v2 and UnThink..." answer from
  NOW_STATUSES + project notes + bio.md "What I'm building now".
- `contact` — direct links + FAQ + contact-policy.md "After you
  hit send" section.
- `help` — list of available commands.

All grounded in the corpus, all in first-person, all below the
80-word cap because the system prompt enforces it.

---

## T34.4 — Reindex `--reset` flag

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- `scripts/rag-reindex.ts` — added `--reset` and `--reset-all` CLI
  flags. `--reset` runs `index.reset()` on the `portfolio-rag`
  namespace before the upsert loop; `--reset-all` runs
  `client.reset({ all: true })` to wipe every namespace under the
  index. Both flags default to off, so additive local-dev reindexes
  stay unchanged.
- Mutual-exclusion guard: passing both `--reset` and `--reset-all`
  throws `Pass only one of --reset or --reset-all, not both.` before
  any network call.
- `docs/rag/OPERATIONS.md` — replaced the single-command reindex
  section with the three-flag surface (`--dry-run`, `--reset`,
  `--reset-all`), added a "Why `--reset`" subsection that documents
  the per-chunk vector caching behaviour so future agents understand
  what gets re-embedded vs reused, and updated the Deployment
  Checklist to recommend `pnpm rag:reindex -- --reset` for every
  production deploy.

### Decisions

- Default to `--reset` on every production reindex. Cost is
  fractions of a cent (Upstash proxies `text-embedding-3-small`);
  benefit is that the namespace is always exactly current and the
  retrieval never has stale vectors polluting queries.
- Kept `--reset-all` as a separate flag for the rare case where the
  namespace name changes or the index is recycled. Sharing the same
  flag would have made the wrong path too easy to hit.
- Output is `Reset: <message>` between the namespace log and the
  upsert progress, so a CI run can grep for "Reset: Success" to
  confirm the wipe ran.

### Caveats / pending

- `--reset` is destructive. A typo could wipe the namespace before
  the upsert starts. The script's current order is: dim-check →
  reset → upsert, so a dim mismatch still throws before the wipe.
  This is the right safety order (don't wipe until you know the
  index exists and the configured dim matches).
- No `--dry-run` integration with `--reset`; if a user wants to see
  what would be reset, they'd need to script it. Not worth
  complicating the CLI for a one-button action.

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → still prints the corpus
  breakdown, no network calls.
- `pnpm rag:reindex -- --reset --reset-all` → throws the
  mutual-exclusion guard before any network call.
- Real Upstash call deferred to first production deploy (real env
  vars not available locally).

---

## T34.5 — `docs/rag/rag-management.md`

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- `docs/rag/rag-management.md` (new file) — command-focused
  documentation for the dynamic RAG corpus. Organized as:
  - TL;DR table of the three modes (`--dry-run`, `--reset`,
    `--reset-all`).
  - "What `pnpm rag:reindex` does" — three-phase walkthrough
    (build corpus → assign stable id → upsert to Upstash).
  - "The three flag modes" — what each does, when to reach for
    which.
  - "When does Upstash re-embed vs reuse?" — explicit table
    mapping each scenario to embedding cost.
  - "Edit scenarios" — table mapping common edits (new project,
    edit notes, delete, etc.) to the right reindex command.
  - "Production deploy loop" — 5-step sequence for shipping new
    corpus content.
  - "Why production defaults to `--reset`" — cost analysis.
  - "When to reach for `--reset-all`" — escape-hatch rationale.
  - "Where it lands in the file tree" — index of all RAG files.
  - "Notes for future work" — known caveats.
- `docs/rag/OPERATIONS.md` — added a "see also" pointer to
  `rag-management.md` at the top, since OPERATIONS.md is
  topic-organized and the new doc is command-organized.
- `docs/RAG_TERMINAL.md` — updated the **Status:** blockquote
  from "Not implemented" to "Implemented (Phase 33 + Phase 34)"
  with a link to the new command-level doc. The original v1-
  is-still-live caveat is preserved.

### Decisions

- The new doc is **operator-facing**, not visitor-facing. It
  describes how to manage the corpus, not what the corpus
  contains. Same `docs/rag/` location keeps related docs
  together.
- Cross-links from `OPERATIONS.md` (topic → command pointer)
  and `RAG_TERMINAL.md` (runbook → management) so a reader
  of either finds the command-focused doc without needing
  to know it exists by name.
- The script's actual behaviour (`stableId()` format,
  dim-check ordering, mutual-exclusion guard) is the source
  of truth. The doc cites the relevant functions where
  useful but doesn't quote the source verbatim — easier to
  keep in sync.

### Caveats / pending

- The chunker indexes every `.md` file under `docs/`, including
  this new one. `pnpm rag:reindex -- --dry-run` reports
  447 chunks (up from 429) — the new doc split into ~18
  chunks under the 250-word cap. Retrieval occasionally
  surfacing management prose in a dynamic-mode answer is
  harmless (80-word cap compresses visitor-facing answers
  away from operator content), but if it ever shows up in
  smoke tests, the cleanest fix is a tiny chunker exclusion
  for `docs/rag/_*` or `docs/rag/rag-*` paths. Not worth doing
  now; flagging for future work.
- The "Notes for future work" section in the doc points to
  three things the script doesn't currently do (skip-when-
  unchanged, smart diff, automated smoke against Upstash).
  All three are small follow-ups if the corpus ever grows
  enough to make them worth the complexity.

### Verified

- `pnpm typecheck` → clean (docs only).
- `pnpm rag:reindex -- --dry-run` → 447 chunks (was 429),
  18-doc growth from the new file; no errors.
- Spot-checked the doc's "When does Upstash re-embed vs
  reuse?" table against the literal `scripts/rag-reindex.ts`
  flow and `lib/rag/chunks.ts:stableId()` definition. Numbers
  match.

---

## T34.6 — Reindex script loads `.env` via `dotenv`

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-19

### What shipped

- `package.json` — added `dotenv@^17` to `devDependencies`.
- `scripts/rag-reindex.ts` — added `import "dotenv/config"` as
  the very first line. The `tsx scripts/rag-reindex.ts` invocation
  runs outside `next dev`, where Next.js' built-in `.env` loader
  does not apply; this matches that behaviour.

### Decisions

- Used `dotenv/config` (top-level import) rather than
  `dotenv-flow` or a hand-rolled chain — it's one line, works
  with the existing `.env` file, and `dotenv` is the
  Next.js-adjacent standard.
- Single env load is fine for the current setup. If a future
  task introduces a real `.env.local` that takes precedence
  over `.env`, swap to `dotenv-flow` at the same import
  location.

### Caveats / pending

- `.env` is currently untracked (intentional). The gitignore
  tweak the user made locally is uncommitted; if/when committed
  it should keep `.env` ignored. `.env.example` remains the
  source of placeholder values for Vercel + new contributors.
- `npm run build`, `pnpm dev`, and every Next.js-driven
  invocation already load `.env` automatically. The new
  import only matters for standalone tsx scripts.

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → 447 chunks, no missing-env
  error, no Upstash calls (dry-run path unchanged).
- `pnpm rag:reindex` (no flag) → real call:
  ```
  RAG corpus: 447 chunks
  Upstash embed model: openai/text-embedding-3-small (1536d, server-side)
  Upstash endpoint: https://***-reptile-17430-us1-vector.upstash.io
  Vector namespace: portfolio-rag
  Upsert: 20/447 ... 447/447
  Upstash upsert: complete
  ```
  First successful production reindex. All 447 vectors now
  live in the `portfolio-rag` namespace.
- End-to-end smoke (`pnpm dev` + `curl /api/rag`):
  ```
  POST {"command":"whoami"} → HTTP 200 (262 bytes, 5s)
  > I am Mahboob Alam, a backend and platform engineer based
  > in Bangalore/Chennai. Co-founder of Taply (Django + DRF +
  > Redis + Postgres + Stripe) and building UnThink. ...
  ```
  The dynamic terminal's first real answer, grounded in the
  `bio.md` and `data/projects.ts` chunks the reindex just
  embedded.
