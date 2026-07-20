# Phase 41 — Terminal space optimization, 8 engineer-in-the-zone error fallbacks, Mahboob/Mehboob name alias & ultra-strict guardrail enforcement

**Phase:** 41 — Terminal space optimization, 8 engineer-in-the-zone error fallbacks, Mahboob/Mehboob name alias & ultra-strict guardrail enforcement
**Phase status:** done
**Date started:** 2026-07-21

---

## T41.1 — System prompt & route guardrails, Mahboob/Mehboob alias, space optimization & 8 fallback variants

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `docs/rag/corpus/system-prompt.md` & `app/api/rag/route.ts` — updated identity and strict guardrails:
  - Taught system prompt that "Mahboob" and "Mehboob" refer to the exact same person (first-person response: "Yes! Mehboob is how colleagues often spell my name—that's me!").
  - Added strict zero-advice guardrail banning relationship, sexual, medical, political, or general life advice.
  - Enforced exact refusal response for all off-topic/non-portfolio queries: `"I can only answer questions related to my software engineering work, projects, and portfolio. For other inquiries, please reach out via /lets-connect."`
- `components/hero/HeroTerminal.tsx` — updated space optimization & error handling:
  - Removed leading `$` prompt glyphs from history lines and active input prompt.
  - Removed `clear ×` button from top bar.
  - Reduced history limit to 15 messages (`MAX_HISTORY_MESSAGES = 15`) with sliding auto-trim.
  - Added 8 distinct first-person engineer-in-the-zone error fallbacks (Docker, Linux kernel, PostgreSQL, Kubernetes, Async pipelines, AWS, WebRTC, Distributed consensus).
- `progress/work-progress-p41.md` — this file.

### Decisions

- **8 Distinct Error Fallbacks.** Pick a random engineering-focused fallback when an error occurs so error responses feel authentic, engaging, and non-repetitive.
- **Explicit Alias Recognition.** Recognize "Mehboob" as an in-scope alias so questions about spelling are answered warmly in first person.
- **Zero Advice Rule.** Absolute refusal gate for non-portfolio queries (e.g. relationship advice, world trivia, political opinions).

### Caveats / pending

- Chat history auto-trims at 15 messages cleanly.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 44/44 static pages compiled clean.
