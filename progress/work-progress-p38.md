# Phase 38 — Linktree on /lets-connect + DSA practice section on /log

**Phase:** 38 — Linktree on /lets-connect + DSA practice section on /log
**Phase status:** done
**Date started:** 2026-07-20
**Date finished:** 2026-07-20

**Goal:** Two user-requested content additions, both with hard
visual constraints:

1. Add the user's Linktree (`https://linktr.ee/i_mahboob_alam`)
   to the "Find me elsewhere" card on `/lets-connect` without
   breaking the lg+ bottom-edge alignment between the right
   sidebar and the left FAQ.
2. Add a "Practice & DSA" section to `/log` between "Key
   achievements" and "What I'm doing now" with links to the
   user's 5 problem-solving profiles.

Two tasks, two commits, two progress entries in this file.
T38.1 lands first; T38.2 follows once verified.

---

## T38.1 — Linktree on /lets-connect

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `data/contact.ts:DIRECT_LINKS` — added a 7th row,
  `Linktree` / `linktr.ee/i_mahboob_alam`, after the existing
  Resume row. `external: true` so it renders with the same
  `↗` affordance and `target="_blank"` behaviour as every
  other external row.
- `data/contact.ts:QUICK_CONTEXT_DOESNT` — removed the "Cold
  'we're hiring 100 engineers' recruiter blasts." line, per
  user instruction, to balance the +1 row added to
  DIRECT_LINKS so the right column's bottom edge stays
  aligned with the left FAQ on lg+ viewports.
- `progress/work-progress-p38.md` — this file.

### Decisions

- **Linktree at slot 7 (after Resume).** User picked "End
  (after Resume)" when offered three placement options.
  Rationale: keeps Email + Resume as the direct-CTA block
  at the bottom; Linktree reads as one last "catch-all
  aggregator" alongside the existing Medium and Taply
  entries.
- **No component changes.** Both `DIRECT_LINKS` and
  `QUICK_CONTEXT_DOESNT` are already rendered through
  mappers in `ContactSidebar.tsx`. The new row and the
  removed line land in the existing renderers with zero
  JSX edits.
- **Dropped line was named by the user.** The
  recruiter-blast line was the one they explicitly asked
  to remove to preserve the right-column alignment. Kept
  the rest of the "Probably doesn't" list intact.
- **Handled the alignment via line count, not via
  CSS.** The user valued the alignment highly enough to
  sacrifice a content line. Tweaking card padding or
  bullet line-height to "make room" would have made
  the right column's two cards visually inconsistent
  with the other cards (different padding breaks the
  same-chrome rule applied since Phase 28).

### Caveats / pending

- No browser smoke run from this session. Verification
  is `pnpm typecheck` clean + manual diff review. User
  should run `pnpm dev` and confirm Linktree row sits
  at position 7, recruiter line is gone, and the right
  column's bottom edge still aligns with the left FAQ
  on lg+.
- If the user later wants the recruiter-blast line
  back, it can simply be re-added to
  `QUICK_CONTEXT_DOESNT` — they'll need to accept a
  ~36px right-column overshoot (one row at the
  established line-height), or shrink something else.

### Verified

- `pnpm typecheck` → clean.
- `data/contact.ts:DIRECT_LINKS.length` → 7 (was 6).
- `data/contact.ts:QUICK_CONTEXT_DOESNT.length` → 3
  (was 4). Net right-column change: zero rows.

---

## T38.2 — DSA practice section on /log

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `data/experience.ts` — added `PracticeLinkItem` interface and
  the `DSA_PRACTICE` registry (5 entries: Codolio, LeetCode,
  Codeforces, Code360, InterviewBit). Each entry carries
  `id`, `label`, `href`, `handle`, `external: true`, and an
  optional `stat?` field that's currently unused.
- `app/log/page.tsx` — imported `DSA_PRACTICE` + `PracticeLinkItem`.
  Inserted a new `<SectionSeparator label="PRACTICE & DSA" />`
  + `<PracticeRow items={DSA_PRACTICE} />` between
  `AchievementGrid` and `NowGrid`. Added the file-local
  `PracticeRow` subcomponent at the bottom of the file.
- `progress/work-progress-p38.md` — T38.2 entry appended.

### Decisions

- **Pills reuse the existing `<Chip color="mauve">` shape.** Same
  Tailwind class set, same `kwDark[3]` color tokens — chip
  vocabulary stays consistent with Timeline tag chips and
  EducationGrid covered/courses lists. Wrapped in `<Link
  target="_blank">` mirroring the existing `ClickableChip`
  pattern (file-local at `app/log/page.tsx:262-277`).
- **Section position: between KEY ACHIEVEMENTS and WHAT I'M
  DOING NOW.** User-specified. Functions as a transitional
  evidence moment — the daily habit that powers both the
  shipping record above and the active projects below.
- **Section shape: single full-width card, eyebrow + pill row.**
  User picked "horizontal pill row (compact)" when offered
  three layouts. Inside a card (`bg-surface border-border
  rounded-[10px] border p-5 md:p-6`) so it respects the
  page's "everything lives in a card" rhythm without
  competing with AchievementGrid above or NowGrid below.
- **`stat?` field added but unset.** Problem counts must come
  from the user, never invented (master §6 + Phase 33 voice
  rules). The field exists so a future commit can add counts
  without a registry or renderer refactor.
- **PracticeRow stays file-local.** Same pattern as Timeline,
  EducationGrid, AchievementGrid, NowGrid — lifted to
  `components/` only if another page needs it.
- **All pills use `mauve` (one color across the row).**
  Alternating colors in a 5-pill row would feel noisy.
  Mauve maps to "protocols / AI / special" in chipColor() —
  closest semantic for "external profile destinations".

### Caveats / pending

- No browser smoke run from this session. User should run
  `pnpm dev` and confirm 5 pills render with `↗` tails,
  wrap cleanly on mobile, and open correct profiles in new
  tabs.
- Pill text uses `↗` after the platform name inside the chip
  to signal external link. Some screens may render the arrow
  glyph inconsistently across fonts; if it looks off in
  JetBrains Mono, the alternative `→` (used in DirectLinkRow)
  is a one-character swap.

### Verified

- `pnpm typecheck` → clean.
- Section order on /log: EXPERIENCE → EDUCATION → KEY
  ACHIEVEMENTS → PRACTICE & DSA → WHAT I'M DOING NOW.
- All 5 href values match user-supplied URLs verbatim.

---

## Phase 38 outcome

Two user-requested content additions landed as separate
commits with self-contained progress entries. T38.1 added
the Linktree aggregator to /lets-connect without disturbing
the lg+ bottom-edge alignment between the right sidebar and
the left FAQ. T38.2 added a compact horizontal pill row of
DSA practice links to /log between KEY ACHIEVEMENTS and WHAT
I'M DOING NOW. No structural changes; no new components; no
new dependencies. Both pages preserve their existing visual
rhythm.