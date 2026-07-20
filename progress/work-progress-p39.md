# Phase 39 — PracticeRow polish: drop duplicate label, fill card width

**Phase:** 39 — PracticeRow polish: drop duplicate label, fill card width
**Phase status:** done
**Date started:** 2026-07-20

---

## T39.1 — PracticeRow polish

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `app/log/page.tsx` — `PracticeRow` subcomponent:
  - Dropped the inner card-level `<p>...Practice & DSA</p>`
    eyebrow. The outer `<SectionSeparator label="PRACTICE &
    DSA" />` above the card already labels the section;
    keeping a second label inside the card was a duplicate
    that doubled the section name on screen.
  - Switched the pill `<ul>` from `flex flex-wrap gap-2` to
    `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2`
    so the 5 cells span the full card width on md+ viewports.
  - Each `<Link>` is now `flex w-full items-center justify-center
    py-1` so its click target fills its grid cell and the pill
    inside is horizontally centered. `py-1` adds vertical hit
    area without changing the chip's visual size.
- `progress/work-progress-p39.md` — this file.

### Decisions

- **Drop the inner eyebrow entirely, don't replace it with
  smaller text.** Two labels for the same beat was the bug;
  the fix is to keep only the canonical one (the
  SectionSeparator above).
- **Grid, not flex with `flex-1`.** Grid's `grid-cols-N` is
  the idiomatic solution for "5 equal cells, evenly
  distributed, wrap on narrow". Flex with `flex-1` would
  handle a single row but break on the wrapped mobile row
  (the orphaned pill would stretch to fill the row, looking
  broken).
- **Pill stays centered in its cell, doesn't stretch.** The
  Phase 38 T38.2 plan's keyword was "compact" — the user
  picked the lowest-weight of three options. Stretching
  pills to fill cells would turn each one into a heavy
  solid bar (dark mauve band filling its cell), fighting
  the compact feel. Cells evenly distributed = "no empty
  space at the row level". Pills centered = preserved chip
  vocabulary.
- **2 / 3 / 5 column progression.** 5 pills on mobile would
  be too narrow to read; 2-col mobile is standard for short
  label lists. The 3-col `sm` (≥ 640px) bridges mobile and
  the 5-col desktop (`md` ≥ 768px) gracefully.
- **`py-1` on the link, not the chip.** The `<Chip>` has
  `py-[3px]` baked in; padding the chip would change its
  rendered size. Padding the link wraps the chip with extra
  vertical hit area (better touch ergonomics) without
  changing the chip's visual.

### Caveats / pending

- No browser smoke run from this session. User should run
  `pnpm dev` and verify the row renders as expected at
  mobile / sm / md+ breakpoints.
- The chip's intrinsic width is ~80px on md+ viewports.
  Each grid cell is roughly 200-220px wide, so there's
  empty space on either side of each chip inside its cell.
  That's intentional (preserves the chip vocabulary); if
  the user wants pills to fill cells instead, that's a
  one-className follow-up.

### Verified

- `pnpm typecheck` → clean.
- Code review: outer `<SectionSeparator label="PRACTICE & DSA" />`
  still labels the section; inner card eyebrow removed;
  pill row is now a 2/3/5-col grid with full-width click
  targets per cell.
- All 5 pill hrefs unchanged (still point at the
  Phase 38 T38.2 URLs).