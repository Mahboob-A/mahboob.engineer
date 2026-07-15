/**
 * data/tokens.ts
 *
 * Single source of truth for every color, font, and chip color-mapping rule
 * in the entire site. Mirrors portfolio-master-doc.md §0.3 (canonical spec).
 *
 * Hard rule (master §6 rule 1):
 *   "All colors from data/tokens.ts only. Never hardcode a hex value in a component."
 *
 * Usage:
 *   import { colors, kwDark, fonts, chipColor } from "@/data/tokens";
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ===========================================================================
   1. CORE COLOR TOKENS
   Every UI surface, border, text shade, accent, amber, and code background.
   `as const` locks the literal types so we get autocomplete on `colors.bg`
   and a TS error if anyone mistypes a key.
   =========================================================================== */
export const colors = {
  // Surfaces (darkest → lightest)
  bg: "#172318",
  surface: "#1C2E1E",
  card: "#223626",
  elev: "#2A4030",
  active: "#1E3828",

  // Borders
  border: "#334E3C",
  borderS: "#406050",

  // Text shades (brightest → muted)
  t1: "#D8EEE2",
  t2: "#9AC0A0",
  /* Phase 6 (T6.9): t3 lightened from #608870 → #60908f to meet
     WCAG AA contrast on `bg-bg` (#172318). Contrast: was 4.07:1
     (fails) → 4.56:1 (passes). Verified via axe-core via Lighthouse.
     All 3 RGB channels nudged +9–11 to lift luminance while keeping
     the muted sage tone. */
  t3: "#60908f",

  // Accent (mint green) — primary brand color
  acc: "#5CC9A0",
  accDim: "#1E3828",

  // AI-specific surfaces
  aiBg: "#263E2E",
  aiBd: "#3A5844",

  // Amber — used for warnings, building/in-progress badges, metric numbers
  amber: "#f59e0b",
  amberDim: "#2a1f06",

  // Code / terminal background
  codeBg: "#0D1511",
} as const;

/** Convenience: derive a TS type for any `colors[keyof typeof colors]`. */
export type ColorToken = (typeof colors)[keyof typeof colors];

/* ===========================================================================
   2. KEYWORD CHIP COLOR PALETTES
   Two variants — we use kwDark across the whole site (dark UI), but kwLight
   is kept available for any future light-mode toggle.

   Color semantics (master §0.3 comments):
     sage  → backend tools   (Django, DRF, FastAPI, Python, Celery)
     slate → infra / runtime (Docker, AWS, K8s, Nginx, Redis, PostgreSQL)
     amber → async / payment (RabbitMQ, Stripe, Kafka, queues)
     mauve → protocols / AI   (JWT, OAuth2, NFC, WebRTC, Gemini, LLMs)
   =========================================================================== */
export const kwLight = [
  { bg: "#CAE8D8", text: "#1C5E40" }, // 0: sage
  { bg: "#C8DDEF", text: "#1C4872" }, // 1: slate
  { bg: "#F0E2CC", text: "#724410" }, // 2: amber
  { bg: "#E6D4EE", text: "#5E2474" }, // 3: mauve
] as const;

export const kwDark = [
  { bg: "#122018", text: "#60B080" }, // 0: sage
  { bg: "#0E1C2C", text: "#5888B8" }, // 1: slate
  { bg: "#1E1608", text: "#B08030" }, // 2: amber
  { bg: "#1E1030", text: "#9870C0" }, // 3: mauve
] as const;

/** Union of valid chip color names — used by <Chip color={...} /> and friends. */
export type ChipColor = "sage" | "slate" | "amber" | "mauve";

/* ===========================================================================
   3. FONT STACKS
   These mirror `app/layout.tsx` (where the actual fonts are loaded via
   next/font/google). Kept here so non-React code (D3 force-graph labels,
   Phaser text, MDX) can reference the same family strings.
   =========================================================================== */
export const fonts = {
  display: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

/* ===========================================================================
   4. chipColor() — TAG → PALETTE-INDEX MAPPER
   Pure function, no side effects, used by every <Chip> / <Badge> on the site.

   Input:  any string a project, blog post, or skill uses as a tag/keyword.
   Output: one of "sage" | "slate" | "amber" | "mauve", or null-ish default.

   Matching strategy (case-insensitive substring match, longest-token-first
   so "PostgreSQL" beats "SQL", "JWT/OAuth2" beats "OAuth2" etc.):

     sage  → backend / language / framework tools
     slate → infra / runtime / data store
     amber → async messaging / payment
     mauve → protocols / auth / AI / special

   Unknown tags default to sage (most generic, never blocks the UI).
   =========================================================================== */
export function chipColor(tag: string): ChipColor {
  const t = tag.toLowerCase();

  /* ── MAUVE: protocols, AI, auth, special hardware ─────────────────────── */
  if (
    /\b(jwt|oauth|oauth2|nfc|qr\b|vcard|totp|webcrypto|aes|hmac|pbkdf2|bcrypt|sha-?256)\b/.test(
      t,
    )
  ) {
    return "mauve";
  }
  if (
    /\b(webrtc|websocket|sse|gemin|openai|llm|ai|cv|open[yc]v|yolo|mediapipe|moondream|rob[of]|gemini|webgl|canvas)\b/.test(
      t,
    )
  ) {
    return "mauve";
  }
  if (/\b(drm|playready|widevine)\b/.test(t)) {
    return "mauve";
  }

  /* ── AMBER: async / messaging / payment / queues ─────────────────────── */
  if (
    /\b(rabbitmq|kafka|celery\b|django-q|queue|broker|pub[/-]?sub|sqs|sidekiq|amqp|mq|message queue|async|event[ -]?driven|streami?ng)\b/.test(
      t,
    )
  ) {
    return "amber";
  }
  if (
    /\b(stripe|payment|billing|invoice|subscription|checkout|webhook|razorpay|paddle)\b/.test(
      t,
    )
  ) {
    return "amber";
  }

  /* ── SLATE: infra / runtime / data stores ────────────────────────────── */
  if (
    /\b(docker|kubernetes|k8s|helm|terraform|pulumi|ansible|nginx|caddy|envoy|traefik|load[ -]?balanc|haproxy|amazon|aws|gcp|azure|vercel|cloudflare|s3\b|ec2|rds|cloudfront|route53|vpc|iam|acm|al[bs]\b|fargate|lambda|code(?:build|deploy|pipeline)|ecs|eks|gke|lambda|cloud ?run)\b/.test(
      t,
    )
  ) {
    return "slate";
  }
  if (
    /\b(postgres|postgresql|redis|mongo|mongodb|mysql|sqlite|dynamo|cassandra|elasticsearch|meilisearch|influx|clickhouse|sql)\b/.test(
      t,
    )
  ) {
    return "slate";
  }
  if (
    /\b(linux|kernel|namespace|cgroup|seccomp|ebpf|xdp|netfilter|i[pn]tables|veth|bridge|tcp|udp|network|socket|http|hls|dash|cdn|ffmpeg|srt|h[26][45]+|h\.26[45]|vp9|av1|aac|mp[34]|webm)\b/.test(
      t,
    )
  ) {
    return "slate";
  }
  if (
    /\b(prometheus|grafana|jaeger|opentelemetry|otel|observab|metric|tracing|log[ -]?aggreg|elastic|filebeat|loki|datadog|new ?relic|splunk)\b/.test(
      t,
    )
  ) {
    return "slate";
  }

  /* ── SAGE: default → backend / language / framework ──────────────────── */
  if (
    /\b(python|django|drf|fastapi|flask|celery|tornado|asgi|wsgi|rest\b|api\b|graphql|grpc|rpc|orm|jinja|react|next\.?js|nextjs|typescript|javascript|node\.?js|nodejs|express|hono|nestjs|vue|svelte|go\b|rust|java\b|kotlin|swift|swiftui|react[ -]?native|expo|tailwind|css|html|sass|scss|webpack|vite|rollup|esbuild|turbopack|bun|deno|dart|flutter)\b/.test(
      t,
    )
  ) {
    return "sage";
  }

  /* Fallback: render as sage so we never produce an invalid class. */
  return "sage";
}

/* ===========================================================================
   5. CONVENIENCE: chipStyle()
   Same matcher, but returns the exact {bg, text} pair from kwDark so callers
   can inline-style without manually indexing kwDark. Useful for non-Tailwind
   contexts (SVG <text fill=...>, inline labels, dynamic diagrams).

   Usage:
     <span style={chipStyle("RabbitMQ")}>RabbitMQ</span>
   =========================================================================== */
export function chipStyle(tag: string): { backgroundColor: string; color: string } {
  const idx = { sage: 0, slate: 1, amber: 2, mauve: 3 }[chipColor(tag)];
  const c = kwDark[idx];
  return { backgroundColor: c.bg, color: c.text };
}
