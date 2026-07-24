# Phase 51: Analytics & Bounce Rate Optimization

**Phase:** 51: Analytics & Bounce Rate Optimization
**Phase status:** in-progress
**Date started:** 2026-07-24

---

## T51.1: Track Terminal & Interactive Component Events

**Task status:** done
**Commit:** pending
**Date:** 2026-07-24

### What shipped

- `components/hero/HeroTerminal.tsx`:
  - Imported `track` from `@vercel/analytics`.
  - Added custom event tracking for `terminal_chip_click` (tracking selected static chip keys).
  - Added custom event tracking for `terminal_mode_change` (tracking mode toggling between static and dynamic).
  - Added custom event tracking for `terminal_query_submit` (tracking dynamic query submission lengths).

### Decisions

- **Client-Side Event Capture**: Wrapped `track()` calls in try/catch blocks to ensure that any client-side ad-blockers or analytics failures fail silently without impacting terminal UI interactions.

### Verified

- `pnpm typecheck` -> Clean.
