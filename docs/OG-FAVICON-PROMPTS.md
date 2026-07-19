# OG / Favicon asset prompts for ChatGPT

Five concrete prompts to generate the portfolio's brand assets
via ChatGPT. Colors and fonts locked to `data/tokens.ts` so the
generated assets match the live site. After the user generates
the assets, Phase 31.2 (separate doc) describes how to wire
them in — this file is generation only.

---

## Brand spec (locked — paste this block at the top of any
follow-up prompt)

> Brand: personal portfolio of Mahboob Alam, a backend / platform
> engineer. Domain is `mahboob.engineer`. The site is dark,
> quiet, deliberately minimal — never overhyped, never
> AI-marketing-flavoured.
>
> Palette (hex, use exactly):
>   Background dark:     #172318  (deep forest green)
>   Surface raised:      #1C2E1E  (one shade up)
>   Card / panel:        #223626  (one more shade up)
>   Accent mint:         #5CC9A0  (single hero green)
>   Accent dim background: #1E3828 (mint behind mint)
>   Amber warm:          #f59e0b  (used SPARINGLY for highlights only)
>   Text bright:         #D8EEE2
>   Text muted:          #9AC0A0
>   Text faintest:       #60908f
>   Border subtle:       #334E3C
>   Code / terminal bg:  #0D1511
>
> Fonts (use these in any rendered text):
>   Display headings:    "Space Grotesk" — geometric, slight tracking-out
>   Body:                "Inter" — neutral, readable
>   Mono / code / labels: "JetBrains Mono" — terminal-feel
>
> Vibe: minimal, technical, calm. No gradients, no neon, no glow.
> No "AI made this" energy. The brand should read as the work of
> an engineer who ships — not a designer who decorates.

---

## Prompt 1 — Favicon (square 512×512 source, scales down)

```
Square icon, 512×512, monochrome-on-dark, ultra-minimal. Background
is the deep forest green #172318. The visual is a single thin
mint-green stroke "M" and "A" overlapped as a ligature — the "M"
on the left and "A" on the right sharing the diagonal stroke so
they read as one compact monogram, about 60% of the canvas height
centered. Stroke width 14% of the canvas height (≈72px at 512),
no fill, rounded line caps, square corners. Color is the single
accent #5CC9A0. No text, no tagline, no glow, no background
illustration, no gradient. The whole image is a rounded-square
icon mask with a 12% corner radius (the macOS / iOS "squircle"
look). Read as the work of an engineer who uses a monogram, not
a designer who decorates.
```

Why: scales cleanly to 16/32/48/180px without losing identity.

---

## Prompt 2 — OG card: personal / default (1200×630)

```
1200×630 social-share card, dark editorial design. Background is
the deep forest green #172318 with a single very subtle radial
gradient (barely visible): one corner lifts to surface #1C2E1E,
the opposite corner to card #223626. No other gradients, no
neon, no glow.

Top-left corner, 64px from edges: a small mint-green dot
(radius 7px, #5CC9A0) followed by a 22pt JetBrains Mono
caps label in #5CC9A0 reading "MAHBOOB ALAM" with letter-spacing
2.

Center of the card (left-aligned, 80px from left edge, vertically
centered): a 76pt Space Grotesk bold heading in #D8EEE2 reading
exactly:

  I build the infrastructure layer
  nobody sees and I write about it.

Two lines as shown. Letter-spacing -2px. Single accent span
inline — the words "infrastructure layer" rendered in #5CC9A0
(the rest of the line in #D8EEE2).

Directly below the heading with 32px gap: a 28pt Inter regular
paragraph in #9AC0A0 reading:

  Distributed systems, async pipelines, kernel isolation,
  video infrastructure, networking. I write the code that
  doesn't show up in a screenshot and breaks the second it
  stops working.

Three lines maximum, line-height 1.4.

Bottom strip, 64px from edges: a 2px mint-green horizontal line
(64px wide) on the left, followed by a 20pt JetBrains Mono
label in #9AC0A0 reading "mahboob.engineer". Right-aligned on
the same row: a 18pt JetBrains Mono label in #60908f reading
"Bangalore / Chennai — India".

Everything is single-pass render — no shadows, no glow, no
embossing, no overlays beyond the one subtle radial gradient.
The whole composition must read as a deliberate minimal
editorial card, not a marketing banner. Stand back and squint:
the hierarchy is (1) the line, (2) the headline, (3) the dot
and eyebrow, (4) everything else.
```

---

## Prompt 3 — OG card: writing surface (1200×630)

```
1200×630 social-share card, same dark forest-green palette and
positioning grid as the default personal card (deep forest
green #172318 background, faint radial gradient, same fonts,
same 80px outer padding, same top-left eyebrow "MAHBOOB ALAM"
with the mint-green dot, same bottom strip with the 2px
mint-green line + "mahboob.engineer" + city line).

Center headline (Space Grotesk bold, 76pt, #D8EEE2, two lines,
letter-spacing -2px), with the words "The Backend Diaries"
inline-accented in mint #5CC9A0:

  Long-form breakdowns of how the
  systems I build actually work.

Directly below, 28pt Inter regular in #9AC0A0:

  I write The Backend Diaries — what I shipped, why the
  architectural choices made sense, and what I'd do
  differently today.
```

---

## Prompt 4 — OG card: project surface (1200×630)

```
1200×630 social-share card, dark editorial, forest-green
palette. Same chrome as the default card (eyebrow top-left
"MAHBOOB ALAM" in mint #5CC9A0 with the mint dot, same
bottom strip with "mahboob.engineer").

Center, a 12pt JetBrains Mono mono caps label in #f59e0b reading
"PROJECT · LIVE" (a deliberately quiet status pill — small,
sparse).

Below that with 24px gap, Space Grotesk bold 76pt #D8EEE2
heading (leave {{TITLE}} as a literal placeholder):

  {{TITLE}}

Below that with 16px gap, 28pt Inter regular in #9AC0A0:

  {{TAGLINE}}

Directly underneath, leave 60px of dead space, then a minimal
3-line diagram (rendered as plain thin lines, 1.5px stroke in
#5CC9A0) — three small rounded rectangles left-to-right
connected by horizontal lines with one amber dot riding the
middle line. The diagram is decorative, not literal — three
boxes labelled (in 11pt mono caps #60908f): CLIENT, SERVICE,
DATA. Nothing else. No labels under the diagram.
```

→ The user pastes `{{TITLE}}` and `{{TAGLINE}}` per project.
The diagram copy is fixed across all 12 projects.

---

## Prompt 5 — Apple touch icon (180×180 source)

```
Square icon, 180×180, optimized for iOS home-screen rendering.
Same composition as the favicon (rounded square 22% corner
radius, deep forest green #172318 background, single mint-green
stroke "MA"/"ligature" monogram centered, no fill). Critically:
THICKER stroke (18% of canvas height, ≈32px at 180) than the
favicon — at 180px the favicon's thin stroke would disappear.
The "M" and "A" are slightly more separated here, recognizable
even at 60px (the iOS Settings list size). No gloss, no gloss
overlay, no iOS-rounded-mask — flat color. Color #5CC9A0 on
#172318.
```

---

## Generation order

Generate in this order to lock the visual vocabulary before
drift:

1. **Prompt 1 (favicon)** — establish the mono-stroke mint
   "M/A" ligature. Sample this first; if it doesn't feel right,
   iterate before generating the OG cards.
2. **Prompts 2 → 3 → 4 (OG cards)** — same chrome, slightly
   different center. The chrome consistency matters most; do
   not generate these in parallel if you're iterating on the
   palette.
3. **Prompt 5 (apple icon)** — derivative of favicon, lower
   risk to generate last.

## What NOT to ask for

Do **not** ask ChatGPT for: gradients between card-shade
hues, drop shadows, glow / neon, abstract shapes, "tech
futurism" 3D shapes, AI-art-pattern circuits, blueprint
grids, hex-pattern backgrounds, marble or photographic
textures, emoji, photographic portrait of a person,
decorative monograms with serifs, or any text that's not
exactly the strings above. If the assistant offers these,
decline — they all read "AI-generated" and conflict with
the existing site chrome.

## Sizes to export

| Asset | Source | Final export sizes |
|---|---|---|
| Favicon | 512×512 | 16, 32, 48, 180 (apple-touch), 192, 512 |
| OG card (each variant) | 1200×630 | 1200×630 PNG only (Twitter + FB + LinkedIn all read PNG at this size) |

Export each from the source. Most ChatGPT image tools export a
square PNG; downscale in Preview / `sips` / `magick`.

When the assets are in hand, continue with the integration
plan at `docs/OG-FAVICON-INTEGRATION.md` (Phase 31.2).
