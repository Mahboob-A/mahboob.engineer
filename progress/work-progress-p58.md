# Phase 58: Critical Root-Cause Fix for Duplicate Game Asset Downloads

**Phase:** 58: Critical Root-Cause Fix for Duplicate Game Asset Downloads
**Phase status:** done
**Date started:** 2026-07-25

---

## T58.1: Drop URL Mutation in ModeSelector.onEnter

**Task status:** done
**Commit:** 0c92674
**Date:** 2026-07-25

### What shipped

- `components/game/ModeSelector.tsx`:
  - Removed the `window.history.replaceState(null, "", "/game?entered=1")` call inside `GameGate`'s `SelectorCard` `onEnter` callback.
  - Kept `setAccepted(true)` as the sole state mutation on Enter.
  - Replaced the Phase 57 comment with a Phase 58 rationale block explaining the actual trigger chain.
  - Left `useSearchParams()` import + `searchParams.get("entered") === "1"` read on line 37 untouched — that is the deep-link suppression path (read once at mount, never re-subscribes).

### Decisions

- **The Phase 57 fix (Gemini-diagnosed) addressed the wrong layer.** Gemini
  correctly observed that an RSC navigation (`GET /game?entered=1&_rsc=...`)
  was happening after the user clicked "Enter Game" and that this destroyed
  the first Phaser Game instance mid-preload. But replacing
  `router.replace(...)` with `window.history.replaceState(...)` does NOT
  suppress the RSC re-fetch — Next.js 16's `useSearchParams()` hook is
  reactive to *any* URL change (pushState, replaceState, router.replace,
  address bar), so the URL mutation still triggers an RSC re-render of the
  `/game` route tree. The dynamic-imported `<GameRoot />` gets
  unmounted/remounted, spawning a second Phaser Game instance with its
  own Loader. Two parallel Loaders, two parallel asset waterfalls, 33
  duplicate GETs.

- **The correct fix is to never mutate the URL during the session.** The
  `?entered=1` flag was being abused as an "I've entered this session"
  marker — that's session state, not URL state. By removing the URL
  mutation entirely, no `useSearchParams()` re-run happens, no RSC
  re-fetch, no second mount. The deep-link suppression (visiting
  `/game?entered=1` directly) still works because `useState(hasEnteredFlag)`
  reads the param exactly once at mount.

- **The HAR file was the smoking gun.** Both parallel asset batches had
  `Referer: http://localhost:3000/game?entered=1` — i.e. the URL had
  *already* changed before either batch started. That's incompatible with
  the "first mount, navigate, second mount" sequence Gemini inferred; it
  confirms the two Phaser Game instances were spawned concurrently,
  triggered by the URL change rather than by `router.replace` specifically.

- **No changes to `game/index.tsx` cleanup logic.** The
  `gameRef.current?.destroy(true)` cleanup is correct behavior for genuine
  unmounts (route navigation away from `/game`). Removing it would leak
  Phaser instances on real navigation. The duplicate-mount problem is
  solved at its source (no URL mutation → no RSC re-render → no second
  mount), not by weakening the cleanup.

### Caveats / pending

- **F5 during gameplay now re-shows the ModeSelector** because
  `?entered=1` is no longer in the URL when the user refreshes. This is
  the documented behavior change under the chosen Option B; the user
  confirmed it is acceptable. If a future requirement needs to remember
  "I've entered game mode" across refreshes, use a session-only
  in-memory marker (a module-level `let hasEnteredThisSession = false;`
  in `ModeSelector.tsx`) — never localStorage (master §6 rule #3) and
  never the URL.

- **The existing `if (gameRef.current) return` strict-mode guard in
  `game/index.tsx` is kept.** It's defensive against a real `<React.StrictMode>`
  wrap if one is ever added in the future; it doesn't cause or solve this
  bug.

- **HTTP cache note:** The HAR shows response headers `Cache-Control: public, max-age=0`
  on the asset responses. Even if two Phaser instances somehow spawned in
  the future, the browser would issue conditional revalidation GETs
  (`If-Modified-Since`) rather than full downloads. That's a separate
  transport optimization, not part of this fix.

### Verified

- `pnpm typecheck` -> Clean (0 TypeScript errors).
- `pnpm test:security` -> All 3 security suites passed cleanly
  (Contact API HTML stripping, RAG prompt injection, Keystatic OAuth
  redaction).

### Manual HAR verification (user to run)

1. `pnpm dev` → open `http://localhost:3000/game` in Chrome → DevTools →
   Network → clear → hard reload.
2. Click "Enter Game".
3. **Expected:** exactly 33 asset requests under `/assets/game/...` and
   `/assets/audio/...`, all 200, no duplicates. Single
   `console.log "[Backend City] assets ready"`.
4. **Not expected:** no `GET /game?entered=1&_rsc=...` request after
   clicking Enter.
5. Deep-link regression: visit `http://localhost:3000/game?entered=1`
   directly → selector card is suppressed, Phaser game starts
   immediately.
6. Refresh-during-game: with the game running, hit F5 → selector card
   re-appears (the documented behavior change under Option B).
