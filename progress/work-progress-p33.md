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
