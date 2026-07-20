# Phase 47 — HeroTerminal container height expansion to h-[380px]

**Phase:** 47 — HeroTerminal container height expansion to h-[380px]
**Phase status:** done
**Date started:** 2026-07-21

---

## T47.1 — Increased dynamic terminal height to h-[380px] max-h-[380px]

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `components/hero/HeroTerminal.tsx` — updated dynamic mode container height from `345px` to `380px` (`h-[380px] max-h-[380px]`), lowering the bottom-pinned input bar by another ~1 inch while expanding the chat scroll container above it.
- `progress/work-progress-p47.md` — this file.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 44/44 static pages compiled clean.
