# Phase 43 — Common Questions corpus: 28 first-person Q/A pairs across 8 groups

**Phase:** 43 — Common Questions corpus: 28 first-person Q/A pairs across 8 groups
**Phase status:** done
**Date started:** 2026-07-21

**Goal:** Expand the dynamic RAG terminal's curated Q/A corpus
from 6 entries (Phase 33 + Phase 37) to ~30, covering the broad
visitor intents a real portfolio receives — identity, hiring,
technical depth, projects, writing, DSA, process, contact. Each
answer ≤80 words, first person, grounded in `data/*.ts` and the
corpus notes, no fabricated numbers.

---

## T43.1 — `lib/rag/common-questions.ts` extraction + 28-entry expansion

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `lib/rag/common-questions.ts` (new) — exports
  `COMMON_QUESTIONS: ReadonlyArray<CommonQuestion>` with 28
  entries grouped by visitor intent:

  ```
  Group 1 — Identity & profile        (4)
  Group 2 — Hiring & roles            (3)
  Group 3 — Technical depth           (6)
  Group 4 — Projects                  (4)
  Group 5 — Writing & learning        (3)
  Group 6 — DSA & practice            (2)
  Group 7 — Process & work style      (2)
  Group 8 — Contact & logistics       (4)
  ```

- `lib/rag/chunks.ts` — replaced the inline `COMMON_QUESTIONS`
  block (lines 73–150, 78 lines) with an import from
  `@/lib/rag/common-questions`. `buildQuestionChunks()` is
  unchanged; it already iterates `COMMON_QUESTIONS` and emits
  one `kind: "question"` chunk per entry.

- `progress/work-progress-p43.md` — this file.

### Decisions

- **Extract to its own file.** `chunks.ts` is 619 lines; 28
  inline questions would push it to ~750 and bury the chunking
  logic. The questions are content; the chunking is mechanics.
  Splitting keeps each file focused and makes per-question edits
  cheap.
- **28, not 30.** Going to 30 forces filler. 28 covers the eight
  visitor intents without duplicating the static FAQ (which
  already covers relocating, notice, visa, freelance, timezone,
  async, ramp, stack) or the existing 6 common-question entries.
- **Avoid exact duplicates with the static FAQ.** The new
  common-questions set picks broader angles the static FAQ
  can't host because it isn't tabular Q/A: who is Mahboob,
  fastest way to reach, where to download resume, where to find
  coding profiles.
- **No fabricated stats.** Phase 42 set the rule: no problem
  counts, streaks, ratings, ranks on DSA platforms. The DSA
  answers carry handles and a "verify on the platforms
  directly" disclaimer instead.
- **Group-3 anchors stack claims in `data/stack.ts:depthNotes`
  and `data/projects.ts`.** Every technical answer references a
  project or registry entry so retrieval cross-references land
  the user on `/work/<slug>` and `/stack` automatically.

### Caveats / pending

- Common-questions retrieval is a *fallback signal*: the LLM
  retrieves top-5 chunks based on semantic similarity, and a
  question chunk only surfaces if its phrasing matches a
  visitor's question. The 28 entries are intentionally
  distinct so the visitor's natural phrasing lands one of
  them; if a question falls outside this set, the dynamic
  terminal still has the structured practice chunk
  (Phase 42), the structured project chunks, the education
  chunks, and the curated `log-and-education.md` doc.
- This commit doesn't reset Upstash. Production deployment
  requires `pnpm rag:reindex -- --reset` to surface the 28
  new chunks to the dynamic terminal.
- The voice-rules cap is 80 words per answer. All 28 answers
  fit comfortably (longest ~46 words). If a future answer
  needs more room, the cap lives in `docs/rag/corpus/voice.md`
  and the system prompt, not in this file.

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → 479 chunks. `kind:
  "question"` count = 28 (was 6, +22). Other kind counts
  unchanged from Phase 42's 457 baseline.
- Inspected the "Does Mahboob practice DSA" question chunk
  via a `tsx` script (then deleted):
  ```
  id: question:lib-rag-chunks-ts:does-mahboob-practice-dsa:ff90433d46d7
  text: Common visitor questions: Does Mahboob practice DSA? ...
        Recommended grounded answer: Yes — actively. Five public
        profiles make the habit verifiable: Codolio aggregates
        total solved, LeetCode (mahboob-alam), Codeforces
        (yurious), Code360 (yurious), InterviewBit (mahboob-a).
        Profiles link from /log. Counts and ratings aren't
        published — verify on the platforms directly.
  metadata: { kind: "question", title: "Does Mahboob practice DSA",
              tags: ["dsa","practice","problem-solving"] }
  ```
- The same visitor phrasing now also surfaces the structured
  `kind: "practice"` chunk from Phase 42 (carries URLs); the
  two chunks complement each other in the LLM's context window.