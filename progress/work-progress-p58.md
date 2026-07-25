# Phase 58: Dynamic Deployment Date & Version in Footer

**Phase:** 58: Dynamic Deployment Date & Version in Footer
**Phase status:** done
**Date started:** 2026-07-25

---

## T58.1: Dynamic Build Metadata Provider & Footer Component Update

**Task status:** done
**Commit:** 54d28f9
**Date:** 2026-07-25

### What shipped

- `lib/build-info.ts` [NEW]:
  - Created central build info provider exporting `SITE_VERSION` (`v2.0`) and `BUILD_DATE` computed from build-time environment variables (`NEXT_PUBLIC_BUILD_DATE`, `VERCEL_GIT_COMMIT_DATE`) with ISO date string fallbacks.

- `next.config.ts`:
  - Added `getBuildDate()` helper computing `NEXT_PUBLIC_BUILD_DATE` during build via git commit timestamp (`git log -1 --format=%cd --date=format:%Y-%m`), Vercel git commit date env, or current ISO date string.

- `components/layout/Footer.tsx`:
  - Replaced hardcoded `v2.0 · last deployed 2026-07` with dynamic `{SITE_VERSION} · last deployed {BUILD_DATE}`.

### Decisions

- **Build-Time Injected Environment Variables + Git Fallback**: Eliminates hardcoded deployment dates while avoiding client hydration mismatches or layout shifts by evaluating build dates statically at SSG/SSR build time.

### Verified

- `pnpm typecheck` -> Passed with 0 TypeScript errors.
- `pnpm test:security` -> All test suites passed cleanly.
