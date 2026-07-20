# Phase 37 — HeroTerminal redesign, freeform dynamic input, Claude Code thinking UI, system prompt guardrails & height alignment

**Phase:** 37 — HeroTerminal redesign, freeform dynamic input, Claude Code thinking UI, system prompt guardrails & height alignment
**Phase status:** done
**Date started:** 2026-07-20

---

## T37.1 — RAG API custom command support, 100-120 word limit, and strict system prompt guardrails

**Task status:** done
**Commit:** `aee58c3`
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
**Commit:** `8ebe872`
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

---

## T37.3 — HeroTerminal redesign, freeform dynamic input, Claude Code thinking UI & CSS shimmer

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `components/hero/HeroTerminal.tsx` — complete redesign of the hero terminal block:
  - Header title bar renders mode selection pills (`[Static]` and `[Dynamic]`) centered via `headerCenter` prop (removed `"terminal"` label).
  - Predefined command chips (`[whoami]`, `[projects]`, etc.) rendered **only** when `Static` mode is active.
  - In `Dynamic` mode, prompt line displays `$ mahboob@portfolio-bastion:` with a real `<input>` field allowing freeform question submissions via Enter/Send button.
  - Added `ThinkingText` component with a pool of 24 Claude Code technical thinking phrases (e.g. `Synthesizing architectural context...`, `Traversing system dependencies...`), cycling every 2.5s with animated trailing dots (`.`, `..`, `...`).
  - Hardened streaming reader: handles empty text stream fallbacks cleanly and transitions to error state on failure.
- `components/hero/HeroTerminal.css` — added `.hero-terminal-thinking-shimmer` CSS rule with left-to-right gradient sweep animation for Claude Code thinking text.
- `progress/work-progress-p37.md` — this file.

### Decisions

- **24 Claude Code-style technical thinking phrases.** Replaced generic "thinking..." with technical system phrases to match the senior backend engineer aesthetic and provide visual delight while waiting for RAG responses.
- **CSS Shimmer text sweep.** Used a CSS linear gradient background sweep (`-webkit-background-clip: text`) to replicate the signature left-to-right light sweep seen in modern AI developer tools.
- **Freeform input in Dynamic mode.** Users can now ask any question directly via text input instead of being restricted to preset chip queries.

### Caveats / pending

- Live streaming responses require `FIREWORKS_API_KEY` and Upstash Vector environment credentials in `.env.local` / production. When unconfigured, 503 error text is displayed gracefully in the terminal.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 44/44 pages compiled successfully.
- Code review: mode buttons in header, preset chips hidden in dynamic mode, custom input form submits `command: "custom"` with query, 24 thinking phrases cycling with shimmer CSS.
