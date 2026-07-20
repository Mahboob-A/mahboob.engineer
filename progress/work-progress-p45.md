# Phase 45 — Terminal chat scrolls inside terminal only (scroll containment)

**Phase:** 45 — Terminal chat scroll containment
**Phase status:** done
**Date:** 2026-07-21

---

## T45.1 — Chat scrolls inside the terminal's dark section, no page-level scroll

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

Three coordinated edits so the chain of `flex-1` actually has height
to fill, and the dark section below the terminal header becomes the
scrollable container for chat:

- `components/ui/TerminalBlock.tsx` — outer wrapper is now
  `flex min-h-0 flex-col overflow-hidden rounded-[10px] border`
  (was: just `overflow-hidden rounded-[10px] border`). The body
  section is now `flex min-h-0 flex-1 flex-col` so it fills the
  remaining vertical space inside the terminal. The children slot
  is also `flex min-h-0 flex-1 flex-col min-w-0`. Title bar gets
  `shrink-0` so it stays at its natural height.
- `components/sections/Hero.tsx` — the right column is now
  `flex min-h-[660px] flex-col lg:min-h-[640px]` (was:
  `flex flex-col justify-between`). This gives the column a defined
  minimum vertical canvas so the diagram + terminal have actual
  height to fill, instead of shrinking to natural content. The
  HeroTerminal call now passes
  `mt-6 flex min-h-0 flex-1 flex-col` (was:
  `mt-6 flex-1 flex flex-col justify-between min-h-[280px]`).
  The terminal now genuinely fills the remaining vertical space in
  the right column.
- `components/hero/HeroTerminal.tsx` — dynamic-mode wrapper is
  now `flex flex-1 min-h-0 flex-col justify-between font-mono`
  (was: `flex flex-col justify-between font-mono min-h-[420px]`).
  Dropped the hard `min-h-[420px]` floor; the column now sizes
  to whatever the parent (terminal body) gives it. With the new
  TerminalBlock body shape, that means the dark section's full
  height. The messages scroll container already has
  `flex-1 min-h-0 overflow-y-auto` from Phase 44, which is the
  canonical flex layout that lets internal scrolling work without
  page-level scrolling.

### Decisions

- **Drop `min-h-[420px]` from the dynamic column.** With the chain
  of flex sizing working end-to-end (right column → terminal →
  body → dynamic column), the column sizes to its parent instead
  of needing a hard floor. Cleaner mental model: the dark section
  IS the chat area, and the dynamic column fills it.
- **Right column `min-h-[660px]` (mobile) / `min-h-[640px]` (lg).**
  Algocode diagram renders at ~270px on lg (viewBox 0 0 980 320
  + DiagramPanel chrome). Adding the terminal's natural minimum
  gives 540–640px combined. 660px gives 20px breathing room on
  mobile; 640px is tight on lg so the terminal stays substantial
  without the column dwarfing the rest of the hero.
- **TerminalBlock's `flex min-h-0 flex-1` on the body.** This is
  the standard flexbox fix for nested scroll containers — without
  `min-h-0`, the body would refuse to shrink below its content
  height, breaking the parent's `flex-1` math. With it, the body
  claims whatever height is available and the inner
  `overflow-y-auto` children scroll correctly.
- **No change to `/lets-connect`.** The contact form's
  TerminalBlock is in a plain `<div>` with no flex sizing, so
  `flex-1` has nothing to fill — the contact form TerminalBlock
  hugs its content as before. The form's `<form className="flex
  flex-col gap-5">` still works inside the new flex children slot
  because it's a flex column with no height constraint.

### Caveats / pending

- The 640–660px right-column height is a guess. If the right
  column looks too tall or too short against the left-column
  hero text and CTAs, fine-tune via a follow-up commit.
- Static mode renders the chips + result inside the dark section
  but doesn't fill it (no chat history, no scroll needed). The
  flex container gives it natural height; the rest is empty dark
  background. That's intentional — static mode is a small
  interaction surface.
- The `hero-terminal-scroll` CSS class still has the `pr-1` for
  scrollbar padding and the custom forest-green scrollbar from
  Phase 40. No changes needed.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → clean, 44/44 static pages compiled.
- `pnpm dev` + `curl /` → page renders, terminal markup present
  (client-rendered so chips / dynamic prompt come from the
  client bundle).
- Layout chain in CSS:
  - `Hero.tsx` right column: `min-h-[660px] / lg:min-h-[640px]`.
  - HeroTerminal wrapper: `flex flex-1 flex-col min-h-0`.
  - TerminalBlock outer: `flex flex-col min-h-0 overflow-hidden`.
  - TerminalBlock body: `flex flex-1 flex-col min-h-0`.
  - Children slot: `flex flex-1 flex-col min-w-0 min-h-0`.
  - Dynamic column: `flex flex-1 min-h-0 flex-col justify-between`.
  - Messages scroll container: `flex-1 min-h-0 overflow-y-auto`.
  - Input form: `shrink-0` so it stays pinned at the bottom.
- Manual browser smoke (to be confirmed by user): clicking
  `[dynamic]`, typing a question, getting a streamed answer that
  scrolls inside the terminal's dark section without the page
  jumping.