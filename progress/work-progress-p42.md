# Phase 42 — /log corpus coverage + DSA practice retrieval targets

**Phase:** 42 — /log corpus coverage + DSA practice retrieval targets
**Phase status:** done
**Date started:** 2026-07-21

**Goal:** Make the dynamic RAG terminal answer "does Mahboob Alam
practice DSA?" with a grounded yes and the user's public practice
profile links. The user already ran `pnpm rag:reindex -- --reset`
after the practice-section UI shipped; the LLM still returned the
private-boundary fallback because nothing in the corpus
contained the affirmation. Two changes fix it: a curated
first-person corpus note for `/log`, and a structured retrieval
chunk sourced from `DSA_PRACTICE` in `data/experience.ts`.

---

## T42.1 — `log-and-education.md` corpus note

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `docs/rag/corpus/log-and-education.md` (new file) —
  first-person `/log` summary covering:
  - Education (SRM MCA grouped coursework; Poridhi
    specialization grouped coursework).
  - Work log (Taply, NexBell, Innovative IT, Eve Healthcare
    one-liners + periods).
  - Key achievements (35%, 17%, 1 enterprise customer).
  - **Yes, I practice DSA** — explicit affirmation +
    Codolio / LeetCode / Codeforces / Code360 / InterviewBit
    handles + URLs.
  - What I'm doing now (Taply, UnThink).
  - "Answer Guidance" — under-80-word rule for the terminal
    plus a no-fabrication guardrail for problem counts,
    streaks, ratings, and rank.

The note lives next to `bio.md`, `hiring.md`,
`private-boundaries.md`, etc. The chunker picks it up
automatically via `buildDocumentChunks()` in
`lib/rag/chunks.ts:448`.

## T42.2 — Structured practice chunks

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `lib/rag/chunks.ts` — imported `DSA_PRACTICE` from
  `data/experience.ts`; added `"practice"` to `RagChunkKind`;
  wired `buildPracticeChunks()` into `buildRagCorpus()`
  between the education and blog builders.
- `lib/rag/chunks.ts:buildPracticeChunks()` — emits a single
  `kind: "practice"` chunk sourced from the registry:
  ```
  Yes — I actively practice data structures, algorithms, and problem solving.
  Five public profiles (Codolio, LeetCode, Codeforces, Code360,
  InterviewBit) make the habit verifiable instead of a claim.
  Codolio aggregates my total solved count across platforms; the
  others are per-platform records.
  Codolio: @yurious — https://codolio.com/profile/yurious
  LeetCode: @mahboob-alam — https://leetcode.com/u/mahboob-alam/
  Codeforces: @yurious — https://codeforces.com/profile/yurious
  Code360: @yurious — https://www.naukri.com/code360/profile/yurious
  InterviewBit: @mahboob-a — https://www.interviewbit.com/profile/mahboob-a/
  These profiles sit next to the shipping record on /log so
  visitors see the practice habit behind the projects.
  ```
  Tags: `["dsa", "data-structures", "algorithms",
  "problem-solving", "practice", "codolio", "leetcode",
  "codeforces", "code360", "interviewbit"]`.
- `progress/work-progress-p42.md` — this file.

### Decisions

- **Both a curated note AND a structured chunk.** The doc adds
  the first-person voice and the canonical answer shape; the
  structured chunk guarantees the URLs and platform handles
  match the registry. Either alone is fragile: the doc can
  drift, and a structured-only chunk reads as a manifest not
  a voice. Together they cover phrasing variance and stay
  anchored in the same source of truth.
- **`RagChunkKind` gains `"practice"`.** No downstream kind-
  specific logic (only `system-prompt` and `voice` are filtered
  in `app/api/rag/route.ts`), so adding the kind is a pure
  type-system extension with no behavior change.
- **Single chunk, not five.** Five near-identical chunks would
  crowd out other context (the route returns top-N retrieval
  results). One chunk carries every URL and tag so any phrasing
  — "practice DSA", "where can I see his profiles", "codeforces
  handle" — lands the same retrieval target.
- **No fabricated frequency.** The user never said "daily"; the
  answer is "actively practice". The doc and the chunk both
  stop at "practice" / "habit" without inventing streaks, ratings,
  or counts. Private-boundaries rules still apply.
- **Don't add a `COMMON_QUESTIONS` entry.** The corpus note's
  "Answer Guidance" section already pins the answer shape, and
  the structured chunk supplies the URLs. A canned answer would
  override genuine retrieval with a fixed string.

### Caveats / pending

- This commit doesn't itself reset Upstash. After the user runs
  `pnpm rag:reindex -- --reset` (or `--reset-all` if the
  namespace changes), the new `practice` chunk and the doc
  chunks become retrievable.
- The corpus note covers the LLM with five section headings,
  one of which is "Yes, I practice DSA". If the chunker's
  250-word cap splits a section mid-sentence, the retrieval
  still surfaces the affirmation — the first sentence of that
  section is in the leading chunk.
- DSA_PRACTICE is still a small registry; if a future phase adds
  more platforms (e.g. HackerRank, Codewars), update both the
  registry and the doc's "Public practice links" bullet. The
  structured chunk auto-syncs because it reads from the registry.

### Verified

- `pnpm typecheck` → clean.
- `pnpm rag:reindex -- --dry-run` → 457 chunks. New `practice`
  kind (1). New `doc` chunks from `log-and-education.md` are
  present in the kind breakdown.
- Inspected the practice chunk via `tsx` script (then
  deleted): id `practice:data-experience-ts:dsa-and-problem-
  solving-practice:84e6fd1711f4`, full text matches the block
  above, all five URLs and handles present, tags include
  `dsa`, `practice`, and every platform name.
- Other chunk counts unchanged from the previous dry-run: blog
  58, boundary 5, contact 1, education 2, experience 11, faq 9,
  project 26, question 6, stack 29, system-prompt 3, voice 2.