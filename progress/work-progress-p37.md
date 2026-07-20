# Phase 37 — HeroTerminal redesign, freeform dynamic input, Claude Code thinking UI, system prompt guardrails & height alignment

**Phase:** 37 — HeroTerminal redesign, freeform dynamic input, Claude Code thinking UI, system prompt guardrails & height alignment
**Phase status:** in-progress
**Date started:** 2026-07-20

---

## T37.1 — RAG API custom command support, 100-120 word limit, and strict system prompt guardrails

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `lib/rag/command-map.ts` — updated `isRagCommand` to recognize `"custom"` as a valid command key so freeform questions typed by users in Dynamic mode pass API validation.
- `app/api/rag/route.ts` — updated POST body handling to allow `command: "custom"` with user-supplied `question` strings. Updated `FALLBACK_SYSTEM_PROMPT` to enforce a 100–120 word count range and strict identity guardrails.
- `docs/rag/corpus/system-prompt.md` — updated corpus system prompt to explicitly scope responses to Mahboob Alam (Co-Founder & Backend Engineer in Bangalore/Chennai, creator of Taply, UnThink, Algocode, Movio, DrishtiAI, etc.), politely decline out-of-scope/other-Mahboob queries with `/lets-connect`, block prompt injections, and cap answer lengths at 100–120 words.
- `progress/work-progress-p37.md` — this file.

### Decisions

- **Allow `"custom"` as command key.** Freeform input queries shouldn't require mapping to pre-canned command aliases. Accepting `command: "custom"` alongside `question` keeps API contracts clean and backwards compatible with legacy chip commands.
- **Explicit 100-120 word count range.** Previously `≤ 80 words` caused complex architecture explanations to truncate mid-sentence. 100–120 words provides enough headroom for complete, technical answers without bloating the terminal UI.
- **Strict identity and out-of-scope guardrails.** To prevent prompt injection, persona drift, or answers about unrelated namesakes, the prompt requires explicit rejection of out-of-scope queries with a clean terminal fallback message.

### Caveats / pending

- Updating `docs/rag/corpus/system-prompt.md` takes effect on the next `pnpm rag:reindex` run, while `FALLBACK_SYSTEM_PROMPT` in `route.ts` covers unindexed or fallback runs immediately.

### Verified

- `pnpm typecheck` → clean.
- Code review: `isRagCommand("custom") === true`.
