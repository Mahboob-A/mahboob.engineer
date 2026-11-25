"use client";

/**
 * components/sections/SkillGraph.tsx
 *
 * The "03 / DEPENDENCY GRAPH" section on `/`. Per master §2 + flat
 * mockup §03 (lines 840–948).
 *
 * A static SVG of hand-laid tech nodes with dependency edges between
 * them. Hover dim/highlight is wired through React state + native
 * event handlers on each node — no inline `<script>` tag (React 19
 * no longer executes scripts rendered as JSX; the previous vanilla-
 * JS approach is replaced with a simple `'use client'` component).
 * D3 is reserved for the `/stack` force graph (T3.4); the landing
 * page uses the curated static layout from the master plan for
 * visual rhythm.
 *
 * Hover behavior (matched to the flat mockup):
 *   - On hover a node: add `has-active` class to the SVG.
 *     - This dims all non-connected nodes to opacity 0.25
 *       via CSS (`.skill-graph.has-active .skill-node:not(.active)`).
 *     - Connected nodes get `.active` (highlighted stroke + glow).
 *     - Connected edges get `.active` (highlighted in accent color).
 *   - On mouseleave: clear everything.
 *
 * Data:
 *   We use a curated subset of STACK that matches the flat mockup —
 *   ~20 production tools. The full 25-item registry is rendered by
 *   the D3 force graph at /stack (T3.4).
 */

import { useState, useMemo } from "react";
import { STACK } from "@/data/stack";
import { FadeUp } from "@/components/motion";

/* ===========================================================================
   Graph layout — hand-tuned coordinates
   =========================================================================== */

/** Each node's SVG position. Coords match the viewBox (0..1180 × 0..640). */
interface SkillNode {
  id: string;
  label: string;
  /** Optional smaller text below the label */
  sub?: string;
  cx: number;
  cy: number;
  r: number;
  domain:
    | "backend"
    | "infra"
    | "data"
    | "async"
    | "ai"
    | "auth"
    | "payment";
  /** Node ids that this node is "directly related to" — keys for hover. */
  rel: string[];
}

/* The full STACK registry, laid out by hand.
 *
 * This used to be a ~20-node curated subset matching an early flat
 * mockup; the 15 entries that were skipped (the AI layer, payments,
 * IaC, realtime transport, and the Open Source / SaaS umbrella nodes)
 * are now included, so the landing graph shows the same surface as
 * /stack's force graph — just as a static, hand-laid map.
 *
 * Layout is columnar: languages on the left, the backend core in the
 * middle, then data / async / AI / infra / commerce fanning right.
 * `rel` lists the hover-neighbours and `EDGES` draws the visible
 * lines — the two are kept in sync by hand.
 */
const NODES: SkillNode[] = [
  // ── languages & systems ──────────────────────────────────────
  {
    id: "python",
    label: "Python",
    cx: 90,
    cy: 250,
    r: 26,
    domain: "backend",
    rel: ["django", "fastapi", "celery", "open-source"],
  },
  {
    id: "go",
    label: "Go",
    cx: 100,
    cy: 430,
    r: 22,
    domain: "backend",
    rel: ["linux", "sysdesign", "open-source"],
  },
  {
    id: "linux",
    label: "Linux",
    cx: 250,
    cy: 470,
    r: 24,
    domain: "infra",
    rel: ["go", "docker", "sysdesign", "open-source"],
  },
  {
    id: "open-source",
    label: "Open",
    sub: "Source",
    cx: 90,
    cy: 570,
    r: 24,
    domain: "infra",
    rel: ["python", "go", "linux", "sysdesign", "cicd"],
  },

  // ── backend core ─────────────────────────────────────────────
  {
    id: "django",
    label: "Django",
    cx: 330,
    cy: 230,
    r: 30,
    domain: "backend",
    rel: ["drf", "celery", "postgresql", "sysdesign", "python", "jwt", "saas"],
  },
  {
    id: "drf",
    label: "DRF",
    cx: 250,
    cy: 120,
    r: 24,
    domain: "backend",
    rel: ["django", "websocket", "jwt"],
  },
  {
    id: "fastapi",
    label: "FastAPI",
    cx: 330,
    cy: 60,
    r: 24,
    domain: "backend",
    rel: ["python", "sse", "webrtc", "opencv"],
  },
  {
    id: "celery",
    label: "Celery",
    cx: 300,
    cy: 350,
    r: 24,
    domain: "backend",
    rel: ["django", "rabbitmq", "redis", "python", "gemini"],
  },
  {
    id: "websocket",
    label: "WebSocket",
    cx: 140,
    cy: 130,
    r: 22,
    domain: "backend",
    rel: ["drf", "webrtc"],
  },
  {
    id: "sysdesign",
    label: "System",
    sub: "Design",
    cx: 480,
    cy: 230,
    r: 26,
    domain: "backend",
    rel: ["django", "docker", "aws", "go", "linux", "open-source"],
  },
  {
    id: "saas",
    label: "SaaS",
    cx: 470,
    cy: 110,
    r: 26,
    domain: "backend",
    rel: ["django", "redis", "stripe"],
  },

  // ── data ─────────────────────────────────────────────────────
  {
    id: "postgresql",
    label: "Postgres",
    cx: 250,
    cy: 300,
    r: 22,
    domain: "data",
    rel: ["django", "redis"],
  },
  {
    id: "mongodb",
    label: "Mongo",
    cx: 400,
    cy: 420,
    r: 20,
    domain: "data",
    rel: ["rabbitmq"],
  },
  {
    id: "redis",
    label: "Redis",
    cx: 180,
    cy: 350,
    r: 20,
    domain: "data",
    rel: ["celery", "saas", "postgresql", "sse"],
  },

  // ── async / messaging ────────────────────────────────────────
  {
    id: "rabbitmq",
    label: "RabbitMQ",
    cx: 470,
    cy: 350,
    r: 22,
    domain: "async",
    rel: ["celery", "mongodb", "docker"],
  },

  // ── AI / realtime ────────────────────────────────────────────
  {
    id: "sse",
    label: "SSE",
    cx: 500,
    cy: 30,
    r: 20,
    domain: "ai",
    rel: ["fastapi", "redis", "openrouter", "chrome-mv3"],
  },
  {
    id: "gemini",
    label: "Gemini",
    cx: 660,
    cy: 60,
    r: 22,
    domain: "ai",
    rel: ["openrouter", "celery"],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    cx: 790,
    cy: 40,
    r: 26,
    domain: "ai",
    rel: ["gemini", "sse", "chrome-mv3"],
  },
  {
    id: "chrome-mv3",
    label: "Chrome",
    sub: "MV3",
    cx: 900,
    cy: 40,
    r: 22,
    domain: "ai",
    rel: ["openrouter", "sse"],
  },
  {
    id: "webrtc",
    label: "WebRTC",
    cx: 200,
    cy: 40,
    r: 22,
    domain: "ai",
    rel: ["websocket", "fastapi", "opencv"],
  },
  {
    id: "opencv",
    label: "OpenCV",
    cx: 90,
    cy: 40,
    r: 20,
    domain: "ai",
    rel: ["webrtc", "fastapi"],
  },

  // ── infra ────────────────────────────────────────────────────
  {
    id: "docker",
    label: "Docker",
    cx: 640,
    cy: 190,
    r: 26,
    domain: "infra",
    rel: ["rabbitmq", "aws", "ffmpeg", "sysdesign", "linux", "pulumi"],
  },
  {
    id: "aws",
    label: "AWS",
    cx: 760,
    cy: 240,
    r: 26,
    domain: "infra",
    rel: ["docker", "nginx", "cicd", "sysdesign", "ffmpeg", "pulumi"],
  },
  {
    id: "nginx",
    label: "Nginx",
    cx: 790,
    cy: 340,
    r: 20,
    domain: "infra",
    rel: ["aws"],
  },
  {
    id: "cicd",
    label: "CI/",
    sub: "CD",
    cx: 900,
    cy: 200,
    r: 20,
    domain: "infra",
    rel: ["aws", "open-source"],
  },
  {
    id: "pulumi",
    label: "Pulumi",
    cx: 920,
    cy: 300,
    r: 20,
    domain: "infra",
    rel: ["aws", "docker"],
  },
  {
    id: "ffmpeg",
    label: "FFmpeg /",
    sub: "HLS",
    cx: 630,
    cy: 330,
    r: 24,
    domain: "infra",
    rel: ["docker", "aws"],
  },

  // ── auth ─────────────────────────────────────────────────────
  {
    id: "jwt",
    label: "JWT/",
    sub: "OAuth2",
    cx: 470,
    cy: 550,
    r: 24,
    domain: "auth",
    rel: ["django", "drf", "bkash"],
  },

  // ── payments ─────────────────────────────────────────────────
  {
    id: "stripe",
    label: "Stripe",
    cx: 660,
    cy: 470,
    r: 22,
    domain: "payment",
    rel: ["saas"],
  },
  {
    id: "bkash",
    label: "bKash",
    cx: 320,
    cy: 570,
    r: 22,
    domain: "payment",
    rel: ["jwt"],
  },
];

/** Edges: `[from, to]` lines. Duplicates of related pairs are deduped. */
const EDGES: ReadonlyArray<readonly [string, string]> = [
  ["python", "django"],
  ["python", "fastapi"],
  ["python", "celery"],
  ["python", "open-source"],
  ["go", "linux"],
  ["go", "sysdesign"],
  ["go", "open-source"],
  ["linux", "docker"],
  ["linux", "sysdesign"],
  ["linux", "open-source"],
  ["open-source", "sysdesign"],

  ["django", "drf"],
  ["django", "celery"],
  ["django", "postgresql"],
  ["django", "sysdesign"],
  ["django", "jwt"],
  ["django", "saas"],
  ["drf", "websocket"],
  ["drf", "jwt"],
  ["fastapi", "sse"],
  ["fastapi", "webrtc"],
  ["fastapi", "opencv"],
  ["celery", "rabbitmq"],
  ["celery", "redis"],
  ["websocket", "webrtc"],
  ["sysdesign", "docker"],
  ["sysdesign", "aws"],
  ["saas", "redis"],
  ["saas", "stripe"],

  ["postgresql", "redis"],
  ["redis", "sse"],
  ["rabbitmq", "mongodb"],
  ["rabbitmq", "docker"],

  ["sse", "openrouter"],
  ["gemini", "openrouter"],
  ["gemini", "celery"],
  ["openrouter", "chrome-mv3"],
  ["chrome-mv3", "sse"],
  ["webrtc", "opencv"],

  ["docker", "aws"],
  ["docker", "ffmpeg"],
  ["aws", "nginx"],
  ["aws", "cicd"],
  ["aws", "pulumi"],
  ["aws", "ffmpeg"],
  ["cicd", "open-source"],
  ["pulumi", "docker"],

  ["jwt", "bkash"],
];

/* ===========================================================================
   Section
   =========================================================================== */

export function SkillGraph() {
  return (
    <FadeUp
      as="section"
      className="border-border scroll-mt-20 border-t pt-[45px] pb-[90px]"
      id="stack"
    >
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <h2 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
            How the stack connects
          </h2>
          <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
            Not a list of logos. Hover a node to trace what it actually works with.
          </p>
        </div>

        <SkillGraphPanel />
      </div>
    </FadeUp>
  );
}

function SkillGraphPanel() {
  /* Track which node is currently hovered (or focused via keyboard).
     React 19 + Next 16 no longer execute <script> elements rendered
     as JSX, so this state replaces the previous vanilla-JS handler
     approach. The hover/focus behavior is identical. */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isHovered = hoveredId !== null;

  /* Set of nodes to highlight: the hovered node + every node in its
     `rel` adjacency list. */
  const activeNodeIds = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const active = new Set<string>([hoveredId]);
    const hovered = NODES.find((n) => n.id === hoveredId);
    if (hovered) for (const rel of hovered.rel) active.add(rel);
    return active;
  }, [hoveredId]);

  /* Set of edge ids to highlight: any edge that touches the hovered
     node. We key edges by "a,b" (sorted) to match the data-edge
     attribute the original script used. */
  const activeEdgeKeys = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const out = new Set<string>();
    for (const [a, b] of EDGES) {
      if (a === hoveredId || b === hoveredId) {
        out.add([a, b].sort().join(","));
      }
    }
    return out;
  }, [hoveredId]);

  return (
    <div className="bg-surface border-border rounded-[10px] border p-6">
      {/* Legend */}
      <div className="text-t3 mb-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px]">
        <span>
          <span className="bg-acc mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" />
          backend
        </span>
        <span>
          <span className="bg-amber mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" />
          infra / platform
        </span>
        <span>
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
            style={{
              backgroundColor: "transparent",
              border: "1.5px dashed color-mix(in srgb, var(--t2) 80%, var(--border-strong))",
            }}
          />
          data layer
        </span>
        <span>
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--amber) 70%, #c9743a)",
            }}
          />
          async / messaging
        </span>
        <span>
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
            style={{
              backgroundColor: "color-mix(in srgb, var(--acc) 55%, #7c5cff)",
            }}
          />
          AI / realtime
        </span>
        <span>
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
            style={{
              backgroundColor: "color-mix(in srgb, var(--acc) 40%, #d163a4)",
            }}
          />
          auth
        </span>
        <span>
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
            style={{
              backgroundColor: "color-mix(in srgb, var(--acc) 70%, #2fa8a0)",
            }}
          />
          payments
        </span>
      </div>

      {/* Horizontally scrollable on small screens */}
      <div className="overflow-x-auto">
        {/* The viewBox covers the full hand-laid map (1180x640). */}
        <svg
          id="skillGraph"
          /* `has-active` toggles the dim-everything-else CSS rule;
             per-node `.active` highlights the hovered node + its
             connections. Both derived from React state. */
          className={`skill-graph block w-full ${isHovered ? "has-active" : ""}`}
          viewBox="0 0 1180 640"
          style={{ minWidth: 980, height: "auto" }}
          role="img"
          aria-label="Skill dependency graph: hover a node to trace connections."
        >
          {/* Edges */}
          <g className="edges">
            {EDGES.map(([a, b], i) => {
              const key = [a, b].sort().join(",");
              const active = activeEdgeKeys.has(key);
              return (
                <line
                  key={i}
                  className={`skill-edge ${active ? "active" : ""}`}
                  data-edge={`${a},${b}`}
                  x1={getNode(a).cx}
                  y1={getNode(a).cy}
                  x2={getNode(b).cx}
                  y2={getNode(b).cy}
                />
              );
            })}
          </g>

          {/* Nodes — hover/focus handlers attached via React; classes
             derived from the activeNodeIds Set. */}
          <g className="nodes">
            {NODES.map((n) => {
              const active = activeNodeIds.has(n.id);
              return (
                <g
                  key={n.id}
                  className={`skill-node ${n.domain} ${active ? "active" : ""}`}
                  data-id={n.id}
                  data-rel={n.rel.join(",")}
                  tabIndex={0}
                  role="button"
                  aria-label={`${n.label}${n.sub ? " " + n.sub : ""} — connected to ${n.rel.join(", ")}`}
                  onMouseEnter={() => setHoveredId(n.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(n.id)}
                  onBlur={() => setHoveredId(null)}
                >
                  <circle cx={n.cx} cy={n.cy} r={n.r} />
                  <text
                    x={n.cx}
                    y={n.cy - (n.sub ? 4 : 0)}
                    /* Inline style, not the `fontSize` attribute — the
                       stylesheet's `.skill-node text { font-size }` rule
                       beats an SVG presentation attribute, so only an
                       inline style can shrink an individual label. */
                    style={{ fontSize: `${fitFontSize(n)}px` }}
                  >
                    {n.label}
                  </text>
                  {n.sub ? (
                    <text
                      x={n.cx}
                      y={n.cy + 12}
                      style={{
                        fontSize: `${Math.min(9, fitFontSize(n) * 0.82)}px`,
                      }}
                    >
                      {n.sub}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

/** Lookup a node by id — O(n) but n is 18, fine. */
function getNode(id: string): SkillNode {
  const n = NODES.find((x) => x.id === id);
  if (!n) throw new Error(`SkillGraph: missing node "${id}"`);
  return n;
}

/**
 * Shrink a node's label so it fits inside its circle.
 *
 * The circles are sized by eye, so a label like "OpenRouter" or
 * "RabbitMQ" would otherwise spill past the stroke. Rather than
 * hand-tuning a radius per node (and re-tuning every time the
 * layout shifts), we derive the font size from the longest line:
 *
 *   usable width = 2r − 8px padding
 *   monospace advance ≈ 0.6em, so chars that fit ≈ width / (0.6 × size)
 *   → size = width / (0.6 × longest line length)
 *
 * Clamped to [7, 11] px so short labels stay legible and long ones
 * never drop below a readable floor.
 */
function fitFontSize(n: SkillNode): number {
  const longest = Math.max(n.label.length, n.sub?.length ?? 0);
  if (longest === 0) return 11;
  const usable = n.r * 2 - 10;
  const raw = usable / (0.6 * longest);
  return Math.max(7, Math.min(11, Math.round(raw * 10) / 10));
}

/* ===========================================================================
   Hover interaction — wired through React state + native event handlers
   on each <g class="skill-node"> (see SkillGraphPanel above). The previous
   vanilla-JS `<script dangerouslySetInnerHTML={...}>` approach was
   removed because React 19 + Next 16 no longer execute scripts rendered
   as JSX (a console error surfaces at hydration). The hover/focus
   behavior is identical.
   =========================================================================== */

/* Export a tiny type re-export so the section consumer knows the STACK
 * dependency we kept (the registry is referenced for the legend & to
 * give the consumer a hook to extend the graph). */
export type { SkillNode };

/* silence unused-import warning while keeping the dependency explicit */
void STACK;
