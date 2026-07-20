# Phase 45 — HeroTerminal bottom-edge input bar pinning & flex-1 scroll area expansion

**Phase:** 45 — HeroTerminal bottom-edge input bar pinning & flex-1 scroll area expansion
**Phase status:** done
**Date started:** 2026-07-21

---

## T45.1 — Bottom-edge pinned typing bar & flex-1 scroll container expansion

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `components/hero/HeroTerminal.tsx` — pinned input bar & scroll expansion:
  - Formatted `<form>` input row with `mt-auto shrink-0 pt-2 border-t border-border/30`, pinning it flush against the bottom edge of the terminal frame at all times.
  - Set chat message list wrapper to `ref={scrollContainerRef} className="hero-terminal-scroll flex-1 min-h-0 overflow-y-auto pr-1 mb-2"`, expanding it to fill 100% of the vertical space above the pinned input bar.
  - Preserved 100% borderless, shadowless input focus resets (`border-0 outline-none focus:ring-0`).
- `progress/work-progress-p45.md` — this file.

### Decisions

- **Bottom-Edge Input Pinning (`mt-auto shrink-0`).** Moving the input form outside the scroll container with `mt-auto shrink-0` guarantees that the `mahboob@engineer:` input bar stays pinned at the bottom edge of the 280px terminal container regardless of whether 0 or 10 messages exist in history.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 44/44 static pages compiled clean.