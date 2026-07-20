# Phase 38 — Linktree on /lets-connect + DSA practice section on /log

**Phase:** 38 — Linktree on /lets-connect + DSA practice section on /log
**Phase status:** in-progress
**Date started:** 2026-07-20

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

**Task status:** pending (lands in the next commit)
**Commit:** —
**Date:** —