# Phase 59: True Root-Cause Fix for Duplicate Game Mount

**Phase:** 59: True Root-Cause Fix for Duplicate Game Mount (Suspense + dynamic + useSearchParams)
**Phase status:** done
**Date started:** 2026-07-25

---

## T59.1: Persistent mountedOnce Guard in GameRoot

**Task status:** done
**Commit:** cbe8cb3
**Date:** 2026-07-25

### What shipped

- `game/index.tsx`:
  - Added a new `mountedOnce` `useRef<boolean>` that persists across the
    useEffect cleanup.
  - Added a guard at the top of the Phaser effect: if
    `mountedOnce.current` is true, bail immediately.
  - Set `mountedOnce.current = true` synchronously after the guard
    passes, before any side effects.
  - The existing `gameRef` guard is kept as-is (still nulls in cleanup).
  - Updated the doc comment to explain the two-flag pattern and the
    Next.js 16 framework-level double-mount that's the real cause.

### Decisions

- **The existing `gameRef` guard was insufficient.** Phase 58 removed
  the URL-mutation trigger, but the new HAR (`localhost-2.har`)
  showed the duplicate requests continued — the second batch was
  returning 304 Not Modified instead of 200 OK, which was masking the
  bug behind what looked like a cache hit. The 4ms gap between the two
  parallel asset batches was the smoking gun: two Phaser Game
  instances were spawning in the same render cycle.

- **Root cause is a known Next.js 16 anti-pattern.** The combination of
  (a) `useSearchParams()` in a Client Component, (b) a `<Suspense>`
  boundary wrapping it, and (c) a `dynamic(..., { ssr: false })` child
  inside the bound component causes the dynamic child to mount twice
  in the same render cycle. The existing `gameRef` guard didn't catch
  the second mount because the cleanup runs `gameRef.current = null`
  *between* the two mounts.

- **Two-flag pattern is the correct fix.** `mountedOnce` is a one-way
  "have we ever initialized" flag that survives cleanup. `gameRef`
  continues to track the current Phaser instance for cleanup-on-unmount.
  The two flags serve different purposes — both are necessary.

- **Did not restructure the page-level Suspense boundary.** The
  `<Suspense>` + `dynamic` + `useSearchParams` pattern in
  `app/game/page.tsx` is canonical Next.js 16 boilerplate. Restructuring
  it would have a larger blast radius (3-4 files), and the same issue
  could re-emerge if any future code adds another `useSearchParams`
  consumer inside the boundary. The targeted guard fix is safer.

- **Kept Phase 58's URL-mutation removal.** It was correct as far as
  it went — eliminating an unnecessary RSC re-fetch trigger — but the
  Suspense + dynamic double-mount was the deeper cause. Both fixes are
  needed.

### Caveats / pending

- **The component itself still double-mounts in dev mode.** This is
  a Next.js 16 framework-level quirk. The Phaser instance is now
  correctly created exactly once because of the new guard. If a future
  code review or test catches the wasted render, the next escalation
  would be to lift `<GameRoot />` out of the Suspense boundary
  (Option B in the plan file).

- **HMR in dev mode can still cause the component to remount when files
  change.** The `mountedOnce` flag is per-component-instance (it's a
  ref), so HMR remounts (which unmount and re-mount the component) WILL
  reset the flag and create a fresh Phaser Game. That is the desired
  behavior — you want a fresh game after editing a game-related file.

- **The fix is invisible at the network level for cache-cold sessions.**
  In a fresh browser session with no cache, batch 1 was 200 OK and batch
  2 was 304 (cache hit). After the fix, batch 2 should not happen at
  all — only 33 requests total, all 200 OK. In a warm cache, the fix
  reduces 33 cache-validation requests to 0.

### Verified

- `pnpm typecheck` -> Clean.
- `pnpm test:security` -> All 3 security suites passed cleanly
  (Contact API HTML stripping, RAG prompt injection, Keystatic OAuth
  redaction).

### Manual HAR verification (user to run)

1. `pnpm dev` -> open `http://localhost:3000/game` in Chrome ->
   DevTools -> Network -> clear -> hard reload.
2. Click "Enter Game".
3. **Expected:** exactly 33 asset requests under `/assets/game/...` and
   `/assets/audio/...`, all `200 OK`, no duplicates. Single
   `console.log "[Backend City] assets ready"`.
4. **Not expected:** no second batch of 33 requests (whether 200 or
   304). No second Phaser canvas in the DOM.
5. DevTools Console: temporarily add `console.log("[GameRoot] useEffect")`
   to the top of the useEffect to verify the effect runs only ONCE.
   Remove the log before committing.
