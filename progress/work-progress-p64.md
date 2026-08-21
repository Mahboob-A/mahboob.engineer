# Phase 64 Progress: RAG Knowledge Pipeline Update & Title Modernization

## Overview
Update the portfolio's RAG knowledge corpus, system prompt, and common questions to proudly highlight UnThink & Taply, encourage interaction with their live simulation engines, link to real products (`https://gettaply.me`, `https://gettaply.me/p/mehboob`, `https://letsunthink.tech/`), and modernize Mahboob's professional title from "Backend & Platform Engineer" to "Backend & DevOps Engineer" across the entire platform.

---

## Tasks

- [x] `T64.1`: Update Hero.tsx, system-prompt.md, bio.md, hiring.md, and project-deep-cuts.md with new title and UnThink/Taply simulation prompts.
- [x] `T64.2`: Update lib/rag/common-questions.ts with updated title, live URLs, simulation links, and new dedicated Q&A entries.
- [x] `T64.3`: Verify corpus chunk generation with `pnpm rag:reindex -- --dry-run` and run full production build tests.
- [x] `T64.4`: Document clean Upstash Vector reindexing instructions for production deployment.

---

## T64.1: Update Title & RAG Persona Prompts

**Task status:** done
**Commit:** 2202cf2
**Date:** 2026-08-21

### What shipped
- `components/sections/Hero.tsx`: Updated eyebrow title to `BACKEND & DEVOPS ENGINEER · BANGALORE`.
- `docs/rag/corpus/system-prompt.md`:
  - Updated identity to `Co-Founder & Backend and DevOps Engineer`.
  - Added mandatory persona rule instructing the RAG agent to speak with genuine pride about UnThink and Taply, warmly encourage trying the interactive simulation engines on `/work/unthink` and `/work/taply`, and link to live platforms (`https://gettaply.me`, `https://gettaply.me/p/mehboob`, `https://letsunthink.tech/`).
- `docs/rag/corpus/project-deep-cuts.md`:
  - Deepened Demo Readiness section with live URLs and dual simulation suite breakdowns.
- `docs/rag/corpus/bio.md`:
  - Updated professional title to `Backend and DevOps Engineer`.
- `docs/rag/corpus/hiring.md`:
  - Updated role preferences to `Backend or DevOps engineering roles`.

### Verified
- `git diff` confirmed zero emojis and zero em dashes.

---

## T64.2: Update RAG Common Questions Dataset

**Task status:** done
**Commit:** 04f6000
**Date:** 2026-08-21

### What shipped
- `lib/rag/common-questions.ts`:
  - Updated all identity, title, and capability questions with "Backend and DevOps Engineer".
  - Updated Taply & UnThink answers to include real live links and direct pointers to `/work/taply` and `/work/unthink`.
  - Added dedicated Q&A targets:
    - "Tell me about Taply"
    - "Tell me about UnThink"
    - "What are the interactive simulations on your portfolio"

### Verified
- `pnpm typecheck` passed.

---

## T64.3: Verify Chunk Aggregation & Production Build

**Task status:** done
**Commit:** Pending
**Date:** 2026-08-21

### What shipped
- Verified 436 corpus chunks across `blog`, `boundary`, `contact`, `doc`, `education`, `experience`, `faq`, `practice`, `project`, `question`, `stack`, `system-prompt`, and `voice`.
- Full `pnpm typecheck`, `pnpm lint`, and `pnpm build` passed (45/45 static pages built).
EOF
