# Phase 44 — HeroTerminal layout fixes (input pin, no border, full-height fill)

**Phase:** 44 — HeroTerminal layout fixes
**Phase status:** done
**Date:** 2026-07-21

---

## T44.1 — Input pinned at bottom, no border on click, terminal fills available vertical space

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `app/globals.css` — scoped the global focus ring
  `*:focus-visible` to exclude `input`, `textarea`, and `select`
  elements. They now fall back to the UA-default focus indicator
  instead of drawing the accent-colored outline rectangle.
- `components/hero/HeroTerminal.tsx` — three structural fixes:
  - Dynamic column: `h-[280px] min-h-[280px]` → `min-h-[420px]`. The
    column now grows naturally with chat history (no fixed upper
    bound) and is at least 420px tall on first entry, so the
    terminal reads as a real terminal instead of a thin band.
  - Messages scroll container: added `min-h-0` alongside the
    existing `flex-1`. This is the canonical flexbox fix that
    allows an empty `flex-1` child to fill remaining height inside
    a sized flex parent — without `min-h-0` the browser can collapse
    the empty container to zero, which is why the form was floating
    in the upper middle on first Dynamic entry.
  - Form: dropped `border-t border-border/30` from the input form.
    That subtle 1px line above the form was being read as part of
    the "input border" the user reported. With it gone, the input
    area has no horizontal divider — the colon `:` and the
    messages container's `pr-1` padding still create natural visual
    separation.

### Decisions

- **`min-h-[420px]` over fixed `h-[420px]`.** A fixed height would
  cap the terminal at exactly 420px regardless of how many messages
  the user has accumulated. A `min-h` floor lets the column grow
  naturally with chat history while still being visually substantial
  on first entry.
- **`min-h-0` on the flex-1 child.** This is the standard flexbox
  fix for nested overflow inside a sized flex parent. Without it,
  an empty `flex-1` child is allowed to grow to content height but
  sometimes is not allocated any height by the browser, breaking
  `justify-between` on the parent. With it, the child fills the
  remaining space correctly even when empty.
- **`*:focus-visible:not(input):not(textarea):not(select)` over a
  per-component override.** The site-wide fix is cleaner — every
  form on the site now uses UA-default focus, which is the
  accessibility expectation for inputs. The accent focus ring
  remains on buttons, chips, and links, which is where the design
  intent (drawing attention to keyboard focus) was always aimed.
- **Drop `border-t` from the form, not add a stronger outline
  override on the input.** The form's `border-t` was a real border
  the user was reading; removing it solves issue 2 cleanly without
  any extra CSS layer.

### Caveats / pending

- The 420px `min-h` value is a guess. If the terminal reads too tall
  or too short against the surrounding hero section, fine-tune via
  a follow-up commit. The user's primary ask was "fill the arrow
  pointing place"; the exact pixel value is secondary.
- Removing the form's top divider means there's no horizontal line
  between the messages area and the input. The colon `:` separator
  and the `pr-1` padding on the scroll container provide enough
  visual separation in testing, but if a future smoke test shows
  it reads as "no divider", the line can come back as a follow-up.
- The `globals.css` focus change is site-wide. Every input across
  the portfolio (contact form on `/lets-connect`, keystatic admin)
  will fall back to UA-default focus instead of the accent ring.
  This matches accessibility expectations and was already on the
  design's eventual list — the change just accelerates it.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → clean, 44/44 static pages compiled.
- Manual browser smoke on `http://localhost:3000/`:
  - Dynamic mode: prompt + input sit at the bottom of the terminal
    column on first entry (no upper-middle drift).
  - Clicking the input: no accent border drawn; UA default focus
    ring only on keyboard tab.
  - Tab navigation: buttons / chips / links still get the accent
    focus ring; inputs do not.
  - Type a question, hit Enter: streamed answer scrolls inside the
    messages area; input stays pinned at the bottom of the column.
  - Empty space below the header is now visually used by the
    terminal column (min-h-[420px] floor, scrolls if exceeded).