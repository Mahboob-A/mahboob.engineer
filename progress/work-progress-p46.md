# Phase 46 — HeroTerminal container height expansion to h-[345px]

**Phase:** 46 — HeroTerminal container height expansion to h-[345px]
**Phase status:** done
**Date started:** 2026-07-21

---

## T46.1 — Increased dynamic terminal height to h-[345px] max-h-[345px]

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `components/hero/HeroTerminal.tsx` — updated dynamic mode container height from `280px` to `345px` (`h-[345px] max-h-[345px]`), extending the terminal box and taking the pinned bottom input line ~2 inches lower while expanding the chat scroll container above it.
- `progress/work-progress-p46.md` — this file.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 44/44 static pages compiled clean.
