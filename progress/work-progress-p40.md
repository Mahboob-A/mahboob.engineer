# Phase 40 — HeroTerminal internal scrolling, fixed height lock, page jump elimination & header cleanup

**Phase:** 40 — HeroTerminal internal scrolling, fixed height lock, page jump elimination & header cleanup
**Phase status:** done
**Date started:** 2026-07-21

---

## T40.1 — Custom scrollbar styling and internal scroll container height lock

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `components/hero/HeroTerminal.tsx` — updated terminal component for internal silent scrolling:
  - Removed `bottomRef.current?.scrollIntoView()` (which was causing window viewport scroll jumps).
  - Implemented silent container scrolling via `scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight` inside `useEffect` on message updates.
  - Wrapped chat history, thinking state, streaming text, and input prompt inside a fixed-height scrollable container (`max-h-[260px] overflow-y-auto`).
  - Removed the `(X/20 msgs)` counter label from the top action bar.
- `components/hero/HeroTerminal.css` — added `.hero-terminal-scroll` CSS rules for forest-green custom scrollbar styling (`::-webkit-scrollbar` + `scrollbar-width: thin`).
- `progress/work-progress-p40.md` — this file.

### Decisions

- **Direct `scrollTop` update over `scrollIntoView`.** `scrollIntoView()` triggers main window viewport movement in browsers when elements are near page boundaries. Target-specific `scrollTop = scrollHeight` on the internal terminal container ensures 100% silent internal scrolling without touching `window.scrollY`.
- **Fixed max-height lock (`max-h-[260px]`).** Locking the terminal container height keeps `HeroTerminal` visually aligned with the left `StatRow` card at all times, preventing page layout expansion as messages accumulate.

### Caveats / pending

- Internal scroll container handles up to 20 stored messages smoothly with custom scrollbar styling.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 44/44 static pages compiled clean.