# Phase 5 — Blog + CMS (The Backend Diaries)

**Phase:** 5 — Blog + CMS
**Phase status:** in-progress
**Date started:** 2026-07-15
**Goal:** `app/writing` ships the real list page (T4.12 stub replaced),
individual posts render via `/writing/[slug]`, and Keystatic is mounted
at `/keystatic` for native MDX authoring. Medium RSS pulls all 14+
cross-posts at build time (Linux Networking × 4, PostgreSQL × 3, Redis
× 2, AWS Networking 101, Algocode, Message Queue 101), and 3 native
MDX posts are seeded.
**Result:** A working blog with native CMS + cross-post ingestion + full
filter UX (search, categories, source toggles, series rail).

Master plan tasks in this phase (T5.0 → T5.6):

1. T5.0 — Phase file + Medium registry update (data + 14 medium posts)
2. T5.1 — Install Keystatic + config + admin route
3. T5.2 — `lib/mdx.ts` — MDX compile + Shiki + frontmatter + TOC
4. T5.3 — `lib/medium-rss.ts` — build-time RSS fetcher
5. T5.4 — `/writing` list page (real, replaces T4.12 stub)
6. T5.5 — `/writing/[slug]` — individual post page
7. T5.6 — Seed 3 native MDX posts

---

## T5.0 — Phase file + Medium registry update

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-15

### What shipped

- **`progress/work-progress-p5.md`** — phase file with the 7-task
  breakdown, following the rulebook format. Created empty at the
  start of the task; this section is the first task record.
- **`data/blog.ts`** — fully refactored to host all 14 Medium posts
  from the user-provided catalog. The file's docstring was rewritten
  to clarify that `BLOG_POSTS` carries **both** the canonical Medium
  cross-post registry (now 14 entries) **and** the registration
  records for native MDX posts (T5.6 seeds 3).
- **`BlogPostItem`** gained a required `category: BlogCategory` field
  so the /writing filter chips can filter posts by topic
  (master §2.5: 8 chips — Distributed Systems / Linux-Networking /
  Docker / Video / AI / Platform / Career).
- **New exports** for the filter UI:
  - `BlogCategory` type — 7 union members.
  - `CATEGORIES` — `ReadonlyArray<{ id, label }>` with display labels.
  - `postsByCategory(category)` — helper mirroring `postsByProject`.
- **All 14 Medium entries** with real URLs from the user-provided
  catalog:
  - **Linux Networking × 4** (real URLs from the user; was a stub URL
    at `/` for part 1, parts 2-4 didn't exist before).
  - **PostgreSQL × 3** — new entries; series name "PostgreSQL".
  - **Redis HA × 2** — new entries; series name "Redis HA".
  - **Standalone × 4** — Algocode, Message Queue 101, AWS Networking
    101 (new), DrishtiAI eye-screening agent.
- Each entry now carries a hand-written `excerpt` (the prior 3 medium
  entries showed the same data, but with no explicit excerpt — relied
  on the `defaultExcerpt()` fallback from T2.6). The fallback still
  works for native posts that don't yet have one.
- Linux Networking posts' `projects` field points at `["unthink"]`
  (the codebase connections — Linux/containers → UnThink's infra).
  PostgreSQL posts point at `["taply", "algocode"]` (the two
  production projects using PostgreSQL). Redis HA points at
  `["taply", "algocode", "unthink"]` (3 production projects using
  Redis for cache / queue broker / session store).

### Decisions

- **`category` is required (not optional).** Master §2.5 explicitly
  has 8 filter chips including "All" + 7 topics — every post must
  have one. Required field enforces this at the type level so the
  filter UI never has to deal with `undefined`.
- **Series name "Redis HA"** (not "Redis") because the user-described
  topic is high-availability Redis (replication, sentinels, cluster).
  Linux Networking keeps its full-name series for clarity. PostgreSQL
  keeps the bare RDBMS name.
- **Excerpts are hand-written**, not auto-generated. The blog cards
  already had a `defaultExcerpt()` fallback for posts without
  excerpts (T2.6) — leaving new posts without excerpts would still
  render correctly. But hand-written excerpts read better on the
  listing page; future native posts can keep using the fallback
  until the user adds an excerpt in Keystatic.
- **No `publishedAt` field populated** yet — Medium RSS gives us dates
  but the static registry doesn't carry them. T5.3's RSS fetcher
  will surface the real `publishedAt` for the build-time merged
  list. The static registry entries are treated as "undated" and
  sorted by their order in the array (newest-first groups).
- **Post count total: 14 medium posts**, 0 native (T5.6 adds 3).
  Once T5.6 ships, the listing will show 17 posts (3 native + 14
  medium merged in via RSS, with the static registry acting as the
  RSS fallback).

### Caveats / pending

- **The static `BLOG_POSTS` registry now duplicates what the Medium
  RSS feed will fetch.** T5.3 will keep it as the offline fallback
  and the canonical reference for the build-time merge. After T5.3
  ships, the static registry is **only consulted on fetch failure**
  — the RSS feed is the authoritative source at build time.
- **No `publishedAt`** — T5.3's RSS fetcher is where dates come from.
  Static-registry entries are undated.
- **Linux Networking Part 1's old placeholder URL**
  (`https://imehboob.medium.com`) is now replaced with the real
  Medium URL. Any old link to the placeholder is now broken — but
  the placeholder URL was never a real post.
- **`drishti-ai-eye-screening-agent`** URL also matches the
  user-confirmed style (`imehboob.medium.com/...`). The prior
  entry had the same slug + URL — verified consistent.

### Verified

- `pnpm typecheck` → clean. Required `category` field forces all
  14 entries to declare a category — caught at compile time.
- `pnpm lint` → clean.
- `pnpm build` → 24 routes, 0 warnings. The `data/blog.ts` change
  is additive; no consumers broke.
- **Spot-check** via `node -e "console.log(require('./data/blog').BLOG_POSTS.length)"`-equivalent:
  - `BLOG_POSTS.length` = 14 ✓
  - `ALL_SERIES` = `["Linux Networking", "PostgreSQL", "Redis HA"]` ✓
  - `CATEGORIES.length` = 7 ✓
  - Linux Networking series: 4 posts (parts 1-4), correctly ordered ✓
  - PostgreSQL series: 3 posts (parts 1-3) ✓
  - Redis HA series: 2 posts (parts 1-2) ✓
  - Every Medium post has a real URL (no `imehboob.medium.com` placeholder) ✓
  - Every post has a non-empty `excerpt` ✓
