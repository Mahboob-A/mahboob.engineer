# Phase 40 — PracticeRow link-card restyle

**Phase:** 40 — PracticeRow link-card restyle
**Phase status:** done
**Date started:** 2026-07-20

---

## T40.1 — Replace mauve chip with /lets-connect-style link blocks

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-20

### What shipped

- `app/log/page.tsx` — `PracticeRow` subcomponent:
  - Removed `<Chip color="mauve">` from each practice link. The
    mauve color sat outside the established /log palette
    (mint, forest-green, neutral text) and didn't match the
    /lets-connect direct-link treatment.
  - Restyled each `<Link>` as a bordered inner block using the
    established `/lets-connect` `DirectLinkRow` pattern:
    `border-border` resting border, `hover:border-acc/40`
    `hover:bg-card/40`, `group` for coordinated hover
    transitions, label uses `text-t1 group-hover:text-acc
    font-mono text-[12.5px] font-semibold`, handle uses
    `text-t3 font-mono text-[11px]`, trailing arrow uses
    `text-t3 group-hover:text-acc text-[14px]`.
  - Each `<li>` carries `h-full` so the inner link block fills
    its grid cell vertically (no empty top/bottom space in the
    row).
  - Showed the platform handle under the label (already present
    in the data layer) so the block carries useful information
    instead of decorative padding.
- `progress/work-progress-p40.md` — this file.

### Decisions

- **Reuse the established DirectLinkRow visual language.** The
  user explicitly named /lets-connect as the reference. Building
  another chip variant would have introduced a fourth link
  treatment on the portfolio, diluting the visual system.
- **Visible `border-border` at rest, not `border-transparent`.**
  /lets-connect uses a transparent resting border because its
  links stack tightly; the grid cells here are discrete units
  that need to read as bordered blocks, so the border stays
  visible.
- **Show the handle under the label.** The data already stores
  `handle` on every entry. Showing it gives each block content
  and helps fill the vertical space without decorative padding.
- **`h-full` on the `<li>`.** Without it, the link block
  collapses to its content height inside the grid cell. With
  it, every link in a row stretches to the tallest sibling's
  height — eliminates the "lots of empty space above/below the
  pill" symptom MarkUp flagged.
- **No `<Chip>` import removal.** `<Chip>` is still used by
  Timeline and Education, so the import stays.

### Caveats / pending

- No browser smoke run from this session. User should run
  `pnpm dev` and verify the new link blocks: no mauve, hover
  matches /lets-connect, handles visible, vertical whitespace
  removed.
- Handle rendering uses `truncate` so a very long handle would
  clip rather than wrap. All current handles are ≤ 12 chars
  (`yurious`, `mahboob-alam`, `mahboob-a`) — well under any
  column width at every breakpoint.

### Verified

- `pnpm typecheck` → clean.
- Code review: no mauve/purple classes remain in `PracticeRow`;
  every color comes from the established token system
  (`border`, `card`, `t1`, `t3`, `acc`).
- Hover semantics match `/lets-connect`'s `DirectLinkRow`
  exactly: mint text + mint arrow on hover, subtle
  `card`-tinted background, mint-tinted border.
- All 5 pill hrefs unchanged (still point at the Phase 38
  T38.2 URLs).