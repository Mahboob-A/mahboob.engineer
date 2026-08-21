# Phase 60: UnThink Founding Project Elevation & Case Study Integration

**Phase:** 60: UnThink Founding Project Elevation & Case Study Integration
**Phase status:** in-progress
**Date started:** 2026-08-21

---

## T60.1: Reorder & Update UnThink in Projects Registry & Case Study Shell

**Task status:** done
**Commit:** —
**Date:** 2026-08-21

### What shipped
- `data/projects.ts`:
  - Added `extension?: string | null;` to `ProjectItem` interface.
  - Reordered `PROJECTS` array to elevate `unthink` to index 0 (#1 Founder project), ahead of `taply` at index 1.
  - Updated `unthink` project definition to `status: "live"`, live URL `https://letsunthink.tech`, Chrome Web Store extension URL, comprehensive 5 headline metrics, full 14-technology stack list, problem statement, and 6 structured build story paragraphs matching `UNTHINK_PORTFOLIO_CASE_STUDY.md`.
- `app/work/[slug]/page.tsx`:
  - Updated `LinksRow` component to render dedicated `↗ chrome extension` badge when `project.extension` is specified.
- `data/stack.ts`:
  - Added `unthink` to project lists for `drf`, `aws`, `nginx`, `docker`, and `celery`.

### Decisions
- Preserved existing Taply founder record while making UnThink index 0 so `/work` automatically displays UnThink as the top founder card.
- Mapped both `url` (live app) and `extension` (Chrome Web Store) so users can test both the web app and browser extension.

### Caveats / pending
- Next task (T60.2) will update `data/experience.ts` to add UnThink to the top of `EXPERIENCE` and update Taply's start date to Mar 2026.

### Verified
- `pnpm typecheck` passed with 0 errors.
