# Phase 41 — /log EducationGrid: colorful chips, clickable links, aggregated coursework

**Phase:** 41 — /log EducationGrid: colorful chips, clickable links, aggregated coursework
**Phase status:** done
**Date started:** 2026-07-20

---

## T41.1 — Group coursework + broaden chip colors + preserve stack deep-links

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `data/tokens.ts:chipColor()` — added Phase 41 academic-subject
  matching before the sage fallback:
  - DBMS / database / data mining / Citus / OLAP / OLTP → slate.
  - Cloud computing / IT infrastructure management → slate.
  - SSH / Mininet / DNS / microservices / rate limit → slate.
  - DSA / data structures / Merkle tree / trie / recursion
    trees → mauve.
  - Data analysis / analytics / statistics → amber.
  Previously-unmatched academic chips no longer collapse into
  the default green sage bucket.
- `data/experience.ts` — added `EducationGroup`; replaced
  `EducationItem.courses?` + `covered?` with `groups?`. Migrated
  SRM to 4 groups / 13 chips and Poridhi to 4 groups / 24 chips
  (6 original topics plus the user's new practical coursework).
  Normalized obvious typos only: `ngixnx` → Nginx, `merkel` →
  Merkle, `shortner` → shortener, `progress` → PostgreSQL.
- `app/log/page.tsx:EducationGrid` — replaced the duplicate
  `courses` / `covered` render branches with one `groups.map()`.
  Each group renders a small uppercase eyebrow + flex-wrap chip
  row. Existing `ClickableChip` is unchanged, so anything that
  resolves through `resolveStackSlug()` becomes a `/stack#<id>`
  deep-link; unmatched coursework stays a plain colored chip.
- `lib/rag/chunks.ts:buildEducationChunks()` — migrated the
  RAG corpus builder from the removed `covered` / `courses`
  fields to `groups`. Group items flatten into education tags;
  each group emits one named corpus sentence so retrieval keeps
  both the topic and its curriculum theme.
- `progress/work-progress-p41.md` — this file.

### Decisions

- **Extend `chipColor()` globally, not per-chip color override.**
  One centralized matcher fixes every surface and future academic
  topic automatically. A `color?` field on curriculum data would
  duplicate token semantics inside content registries.
- **One `groups` shape for degree + specialization.** The former
  `courses` (SRM) and `covered` (Poridhi) fields were parallel
  ways to say the same thing. Four named groups in both cards
  give them the same internal rhythm and keep a 24-topic Poridhi
  curriculum scannable.
- **Keep stack links resolver-driven.** Did not add Citus, SSH,
  Mininet, DNS, Merkle trees, rate limiting, or microservices to
  the global STACK registry — doing so would expand `/stack` and
  imply production depth. Phase 12 T12.3's established rule stays:
  matching labels link; unmatched labels remain plain chips.
- **Use user's coursework as chips, including practical builds.**
  `Full-stack chat app: design, build & deploy` and `URL shortener:
  practical design` remain in the same chip system rather than a
  second prose style, preserving scan consistency.
- **Update the RAG corpus in the same commit.** Typecheck caught the
  legacy consumer in `lib/rag/chunks.ts`. Leaving it unchanged
  would break the build and prevent newly-added coursework from
  being retrievable by the dynamic terminal.

### Caveats / pending

- No browser smoke run from this session. Poridhi has 24 chips
  against SRM's 13, so the Poridhi card will still be taller;
  grouping prevents an unstructured wall of chips but cannot make
  unequal content volumes physically equal without hiding content.
- New coursework labels that don't resolve to STACK remain plain:
  e.g. Full-stack chat app, URL shortener, Mininet, Merkle tree,
  SSH, DNS server. Adding any as /stack entries is a separate
  content decision.
- RAG production index will need the normal
  `pnpm rag:reindex -- --reset` after deployment to include the
  new coursework; local typecheck does not mutate Upstash.

### Verified

- `pnpm typecheck` → clean after migrating the RAG education
  chunk builder.
- `ClickableChip` still uses `chipColor(label)` and
  `resolveStackSlug(label)` unchanged.
- All colors still come from `data/tokens.ts`; no component hex.
- Representative links resolve: Redis → `/stack#redis`, RabbitMQ
  → `/stack#rabbitmq`, Kubernetes → `/stack#kubernetes`, Nginx →
  `/stack#nginx`, PostgreSQL internals / Citus for PostgreSQL →
  `/stack#postgresql`, Load balancer → `/stack#load-balancer`,
  Kafka from scratch → `/stack#kafka`, OpenTelemetry →
  `/stack#opentelemetry`, Linux networking → `/stack#linux`,
  Docker internals → `/stack#docker`, eBPF → `/stack#ebpf`, AWS
  architecture for scaling → `/stack#aws`, Pulumi → `/stack#pulumi`.
