# Phase 38 — First-person guardrail rejections & strict off-topic / general knowledge blocking

**Phase:** 38 — First-person guardrail rejections & strict off-topic / general knowledge blocking
**Phase status:** done
**Date started:** 2026-07-21

---

## T38.1 — First-person guardrail rejections and zero-general-knowledge prompt enforcement

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `docs/rag/corpus/system-prompt.md` — updated system prompt corpus file:
  - Formatted exact rejection phrase in first person: *"I can only answer questions related to my software engineering work, projects, and portfolio. For other inquiries, please reach out via /lets-connect."*
  - Added strict zero-general-knowledge enforcement: explicitly bans answering trivia, world facts (e.g. "Who is PM of India?"), local prices/news ("petrol price in Kolkata"), politics/religion ("Why does BJP..."), explicit/inappropriate content, or non-portfolio topics.
  - Added explicit forbidden query categories and prompt injection defenses.
- `app/api/rag/route.ts` — updated `FALLBACK_SYSTEM_PROMPT` to mirror the updated corpus system prompt instructions verbatim.
- `progress/work-progress-p38.md` — this file.

### Decisions

- **First-person rejection phrasing.** Replaced "Mahboob Alam's software engineering work..." with "my software engineering work..." so out-of-scope responses remain consistent with first-person conversational identity.
- **Zero-general-knowledge mandate.** Explicitly instructed the model that it possesses zero general knowledge / trivia capabilities, preventing the LLM from answering world trivia or local fuel price queries and forcing a polite, first-person rejection.

### Caveats / pending

- Re-indexing the corpus (`pnpm rag:reindex`) will update vector chunks in Upstash Vector, while `FALLBACK_SYSTEM_PROMPT` covers current dynamic responses immediately.

### Verified

- `pnpm typecheck` → clean.
- Code review: First-person rejection phrasing and strict zero-general-knowledge blocking confirmed across both `system-prompt.md` and `route.ts`.