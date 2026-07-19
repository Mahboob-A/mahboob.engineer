# Phase 20, 21, 22 — Eve Healthcare keywords, bKash, stack reference notes

**Phase:** 20 + 21 + 22 (single retrospective document covering three related polish commits)

**Phase status:** done

**Date:** 2026-07-18

**Goal:** Three small follow-up commits landed between Phase 19 and Phase 23. Each touched a different surface (`data/experience.ts`, `data/stack.ts`, the `/stack` detail panel UI) but all share the same theme of filling small content/data gaps surfaced during manual QA. This retrospective captures them in one document because each commit is thin on its own.

**Why this document:** The progress directory only had files through `work-progress-p8.md` at the time (with later phases appended inside p8). Phases 20, 21, and 22 didn't get their own files. Rather than retroactively create three thin stub files, this single retrospective documents all three with full context.

---

## Phase 20 — Add keywords to Eve Healthcare

**Task status:** done
**Commit:** `fb9be1e`
**Date:** 2026-07-18

### What shipped

- **`data/experience.ts`** — added 3 keywords to the `eve-healthcare` entry. Was `tags: []`, which rendered an empty Keywords section with a `"0 techs · links go to /stack"` caption. The 3 tags were pulled from the bullets:
  - `WebSocket` — explicit in the "Real-Time Communication" bullet ("real-time in-app chat over WebSocket").
  - `DRF` — the framework that would have served the 22% of patient dashboard APIs (matches the late-2023 DRF era at Innovative IT / Eve Healthcare).
  - `Redis` — backend cache that would sit behind both the realtime chat and the dashboard analytics layer.

### Decisions

- **Tags resolve through `resolveStackSlug()`** — same chip-pattern as the other 3 experience entries. WebSocket → `/stack#websocket`, DRF → `/stack#drf`, Redis → `/stack#redis`. All 3 chips render as clickable links.
- **No `notes` field added** — Eve Healthcare's deep-dive still falls back to bullets-joined via StoryPath (same as before). The user only provided bullets for this entry.
- **All 3 tags were inferred from the bullets** — no fabricated tech stack. WebSocket is explicit; DRF + Redis are reasonable inference for the time period and the bullets' context (realtime + analytics + dashboard APIs).

### Caveats / pending

- **DRF and Redis are inferences, not hard facts.** The bullets don't say "DRF" or "Redis" verbatim. Honest inference for the era; user should fact-check before publishing.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Live `/log/eve-healthcare` smoke: Keywords section now renders `"3 techs · links go to /stack"` with three clickable chips.
- Browser smoke: Playwright screenshot confirms chips render in the same color scheme used elsewhere on `/log`.

---

## Phase 21 — Add bKash to /stack payment domain

**Task status:** done
**Commit:** `936cae3`
**Date:** 2026-07-18

### What shipped

- **`data/stack.ts`** — added a new `bkash` entry under the existing `payment` domain, mirroring the shape of the Stripe entry:
  ```ts
  {
    id: "bkash",
    name: "bKash",
    domain: "payment",
    projects: ["nexbell"],
  }
  ```

### Decisions

- **bKash was the dominant Bangladesh mobile-wallet gateway at NexBell Inc.** (Nov 2024 – Jun 2026). Integrated the refund and disbursement flows against their REST API.
- **`projects: ["nexbell"]` is a reference string**, not a slug that resolves to a project card. There is no `/work/nexbell` case study today (and won't be — NexBell is a former employer, not a portfolio project). Phase 22 fixed the resulting "Used in 0 projects" display; this commit ships the data first.
- **Payment domain now has 2 entries**: Stripe (Taply) + bKash (NexBell reference). Honest record of payment-stack exposure.

### Caveats / pending

- **No depth marker on bKash.** The other payment-domain entry (Stripe) doesn't have a depth marker either (payment isn't a "learning" domain). Consistent.
- **No bKash project page anywhere** — the slug `"nexbell"` is a forward reference; Phase 22 made the UI handle it gracefully.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Live `/stack` smoke: bKash appears in the Payment category (2 entries: Stripe + bKash).
- Browser smoke: Playwright click on bKash row opens the detail panel heading `"bKash"`.

---

## Phase 22 — Reference-note for unresolved stack projects

**Task status:** done
**Commit:** `05b1f2a`
**Date:** 2026-07-18

### What shipped

Phase 21 added bKash with `projects: ["nexbell"]` — but `PROJECTS_BY_SLUG["nexbell"]` returned `undefined` (no case study exists). The detail panel's "Used in N projects" loop silently filtered the unresolved slug out, leaving bKash reading `"Used in 0 projects / Not yet wired into any project."` The same issue affected `JWT/OAuth2` (`projects: ["taply", "algocode", "nexbell"]`) — Taply and Algocode rendered, but NexBell was silently dropped.

- **`components/stack/StackShell.tsx`** — splits each tech's `projects` array into two buckets:
  - `resolvedProjects`: project cards (`PROJECTS_BY_SLUG[slug]` exists).
  - `unresolvedRefs`: reference strings — looked up against `EXPERIENCE_BY_ID` to recover the company + period metadata.
- **`components/stack/TechDetailPanel.tsx`** — 4-way caption logic:
  - 0 refs total → `"Not yet wired into any project."`
  - N projects (no refs) → `"N projects"`
  - N refs (no projects) → `"N reference(s)"` with company list
  - Both → `"N projects + M reference(s)"` with both lists, plus a separate `"Referenced at N companies"` section.

### Decisions

- **`EXPERIENCE_BY_ID` already exists** — added in T3.1, holds the experience registry keyed by `id`. Reusing it means the reference lookup has zero new data and zero new helpers.
- **The "references" semantic is honest** — bKash wasn't a portfolio project, but it WAS a real production integration. Calling it out as a "reference" (with company + period) reads truer than silently dropping it or pretending it shipped as a portfolio project.
- **4-way caption is the cleanest UX** — every combination of (projects × references) renders meaningfully. No edge case for "0 of either but it's in the registry" (that case is filtered upstream).
- **No new components** — the entire change is in StackShell (data split) + TechDetailPanel (render switch). No CSS, no new file, no new dep.

### Caveats / pending

- **The `projects: ["nexbell"]` slug is a "phantom reference"** — it works because NexBell is an entry in EXPERIENCE, but if a future tech ships with `projects: ["some-company-id"]` where `some-company-id` isn't in EXPERIENCE, that reference silently drops. Future-proof fix would be a hard lookup table mapping phantom slugs to companies. Out of scope.
- **No edit-by-id for references** — they're read-only display strings. If the user wants to add a "What I did with this" sentence per reference, that's a follow-up schema extension.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 19 routes + middleware, 0 warnings.
- Browser smoke (Playwright):
  - Click bKash → detail panel heading `"bKash"`, caption `"USED IN 1 REFERENCE"`, body line `"NexBell Inc. · Nov 2024 – Jun 2026"`.
  - Click JWT/OAuth2 → caption `"USED IN 2 PROJECTS + 1 REFERENCE"`, Taply + Algocode project cards, separate `"REFERENCED AT 1 COMPANY"` section with NexBell Inc. note.

---

## Phases 20 + 21 + 22 wrap-up

Three commits landing on the same evening (2026-07-18), each a small fix surfaced during manual QA of the post-Phase-19 data copy pass.

| Surface | Before | After |
|---|---|---|
| `/log/eve-healthcare` Keywords | `"0 techs · links go to /stack"` | `"3 techs · links go to /stack"` with WebSocket / DRF / Redis chips |
| `/stack` Payment category | 1 entry (Stripe) | 2 entries (Stripe + bKash) |
| `/stack` bKash detail panel | `"Used in 0 projects"` (silent filter) | `"Used in 1 reference"` with NexBell Inc. note |
| `/stack` JWT/OAuth2 detail panel | `"Used in 2 projects"` (NexBell silently dropped) | `"Used in 2 projects + 1 reference"` with explicit NexBell section |

`pnpm build` reports 19 routes + `ƒ Proxy (Middleware)`. 0 warnings. `pnpm typecheck` clean. Pre-existing lint errors in `Blog.tsx` / `Hero.tsx` / `HeroTerminal.tsx` unchanged.

The next work (Phase 23) tackled the navbar active-state + Next 16 proxy migration, which is documented in `work-progress-p23.md`.