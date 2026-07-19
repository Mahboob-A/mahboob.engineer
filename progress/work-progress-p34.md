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
