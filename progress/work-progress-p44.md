# Phase 44 — HeroTerminal height clamping, flex height propagation & internal scroll fix

**Phase:** 44 — HeroTerminal height clamping, flex height propagation & internal scroll fix
**Phase status:** done
**Date started:** 2026-07-21

---

## T44.1 — Clamped container height, flex height propagation & internal scroll containment

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `components/ui/TerminalBlock.tsx` — updated inner body wrapper elements with `flex-1 flex flex-col min-h-0` so flex height boundaries propagate cleanly to `children`.
- `components/hero/HeroTerminal.tsx` — updated dynamic layout with strict height clamping:
  - Clamped outer container to `h-[280px] max-h-[280px] overflow-hidden flex flex-col justify-between`.
  - Set chat history container to `flex-1 min-h-0 overflow-y-auto`.
  - Guaranteed 0 vertical outer container expansion when messages accumulate.
  - Maintained 100% frameless, borderless input focus resets (`border-0 outline-none focus:ring-0`).
- `progress/work-progress-p44.md` — this file.

### Decisions

- **Strict Container Clamping (`max-h-[280px] overflow-hidden`).** Combining `max-h-[280px]` with `overflow-hidden` ensures the terminal container outer dimensions stay 100% static, locking layout height while forcing all chat overflow to scroll internally inside the chat log area.
- **Flex Height Propagation (`min-h-0 flex-1 flex flex-col`).** Adding flex height propagation down through `TerminalBlock.tsx` allows child scroll containers to measure available height accurately.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 44/44 static pages compiled clean.