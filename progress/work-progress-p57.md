# Phase 57: Fix Duplicate Asset & Audio Downloads in Game Mode

**Phase:** 57: Fix Duplicate Asset & Audio Downloads in Game Mode
**Phase status:** done
**Date started:** 2026-07-24

---

## T57.1: Client-side URL History State Update

**Task status:** done
**Commit:** pending
**Date:** 2026-07-24

### What shipped

- `components/game/ModeSelector.tsx`:
  - Replaced `router.replace("/game?entered=1")` with `window.history.replaceState(null, "", "/game?entered=1")` inside `onEnter()`.

### Decisions

- **Prevent Double Asset Downloads**: Updated browser URL query parameter without triggering a Next.js RSC server fetch and route tree re-render, preserving the initial Phaser Game instance so all 23 images and 10 audio files are downloaded exactly once.

### Verified

- `pnpm typecheck` -> Clean.
- `pnpm test:security` -> Passed cleanly.
