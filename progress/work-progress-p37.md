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

---

## T37.2 — TerminalBlock header customization and Hero right-column layout alignment

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `components/ui/TerminalBlock.tsx` — added `headerCenter?: ReactNode` prop to `TerminalBlockProps`. Updated the title bar flex layout to center custom controls (e.g. mode toggle buttons) cleanly between the traffic light dots and symmetric right-side filler.
- `components/sections/Hero.tsx` — updated right column layout container from `self-start` to `flex flex-col justify-between` and passed `className="mt-6 flex-1 flex flex-col justify-between min-h-[280px]"` to `HeroTerminal` so the terminal's bottom border aligns visually with the `StatRow` bottom line on `lg+` screens.
- `components/hero/HeroTerminal.tsx` — added `HeroTerminalProps` interface with optional `className`.
- `progress/work-progress-p37.md` — this file.

### Decisions

- **Use `headerCenter` prop over fixed string label.** Adding `headerCenter` allows components like `HeroTerminal` to pass interactive header controls (the mode selector pills) directly into the terminal header bar while keeping `TerminalBlock` generic and reusable.
- **Flexbox container alignment for Hero right column.** Setting `flex flex-col justify-between` on the right column container ensures the terminal block expands cleanly to match the left column's height.

### Caveats / pending

- Header mode controls will be rendered inside `headerCenter` in T37.3 when `HeroTerminal` is updated.

### Verified

- `pnpm typecheck` → clean.
- Title bar layout verified for both string `label` and `headerCenter` rendering paths.
