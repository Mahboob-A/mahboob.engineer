# Phase 54: Enhanced Vercel Analytics Event Tracking

**Phase:** 54: Enhanced Vercel Analytics Event Tracking
**Phase status:** in-progress
**Date started:** 2026-07-24

---

## T54.1: Navigation Links & Game Mode Switch Tracking

**Task status:** done
**Commit:** pending
**Date:** 2026-07-24

### What shipped

- `components/layout/ActiveNavLink.tsx`:
  - Imported `track` from `@vercel/analytics`.
  - Added `onClick` tracking for `nav_link_click` (`/log`, `/work`, `/stack`, `/writing`, `/lets-connect`).
- `components/layout/ModeTogglePill.tsx`:
  - Created client-side ModeTogglePill component with `track("game_mode_click", { mode })` analytics event.
- `components/layout/Navbar.tsx`:
  - Imported extracted `ModeTogglePill` component.

### Decisions

- **Client Navigation Telemetry**: Captured link clicks and mode toggle interactions via `@vercel/analytics` to trace visitor flows across inner routes and game mode entries.

### Verified

- `pnpm typecheck` -> Clean.
