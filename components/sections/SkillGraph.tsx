/**
 * components/sections/SkillGraph.tsx
 *
 * The "03 / DEPENDENCY GRAPH" section on `/`. Per master §2 + flat
 * mockup §03 (lines 840–948).
 *
 * A static SVG of hand-laid tech nodes with dependency edges between
 * them. **Vanilla JS** handles the hover dim/highlight effect — no
 * React state, no D3. D3 is reserved for the `/stack` force graph
 * (T3.4); the landing page uses the curated static layout from the
 * master plan for visual rhythm.
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

import { STACK } from "@/data/stack";

/* ===========================================================================
   Graph layout — hand-tuned coordinates matching the flat mockup
   =========================================================================== */

/** Each node's SVG position. Coords match the flat mockup viewBox (0..900 × 0..460). */
interface SkillNode {
  id: string;
  label: string;
  /** Optional smaller text below the label */
  sub?: string;
  cx: number;
  cy: number;
  r: number;
  domain: "backend" | "infra" | "data" | "learning";
  /** Node ids that this node is "directly related to" — keys for hover. */
  rel: string[];
}

/* Curated subset of STACK that matches the flat mockup's layout.
 * Skipped: graph-specific entries (sse, websocket, webrtc — too niche
 * for the landing), and Stack's lighter tools (nginx, pulumi, etc. —
 * those show up in /stack's full force graph). */
const NODES: SkillNode[] = [
  // core
  {
    id: "django",
    label: "Django",
    cx: 450,
    cy: 250,
    r: 30,
    domain: "backend",
    rel: ["drf", "celery", "postgresql", "sysdesign"],
  },
  {
    id: "drf",
    label: "DRF",
    cx: 320,
    cy: 160,
    r: 24,
    domain: "backend",
    rel: ["django", "websocket"],
  },
  {
    id: "celery",
    label: "Celery",
    cx: 320,
    cy: 340,
    r: 24,
    domain: "backend",
    rel: ["django", "rabbitmq", "redis"],
  },
  {
    id: "websocket",
    label: "WebSocket",
    cx: 480,
    cy: 120,
    r: 22,
    domain: "backend",
    rel: ["drf"],
  },
  {
    id: "sysdesign",
    label: "System",
    sub: "Design",
    cx: 560,
    cy: 250,
    r: 26,
    domain: "backend",
    rel: ["django", "docker", "aws", "go"],
  },
  {
    id: "ffmpeg",
    label: "FFmpeg /",
    sub: "HLS",
    cx: 200,
    cy: 250,
    r: 24,
    domain: "backend",
    rel: ["docker", "aws"],
  },

  // infra
  {
    id: "docker",
    label: "Docker",
    cx: 650,
    cy: 180,
    r: 26,
    domain: "infra",
    rel: ["rabbitmq", "aws", "kubernetes", "ffmpeg", "sysdesign"],
  },
  {
    id: "aws",
    label: "AWS",
    cx: 760,
    cy: 260,
    r: 26,
    domain: "infra",
    rel: ["docker", "nginx", "cicd", "terraform", "sysdesign", "ffmpeg"],
  },
  { id: "nginx", label: "Nginx", cx: 700, cy: 360, r: 20, domain: "infra", rel: ["aws"] },
  {
    id: "cicd",
    label: "CI/",
    sub: "CD",
    cx: 780,
    cy: 150,
    r: 20,
    domain: "infra",
    rel: ["aws"],
  },

  // data
  {
    id: "postgresql",
    label: "Postgres",
    cx: 250,
    cy: 400,
    r: 22,
    domain: "data",
    rel: ["django"],
  },
  {
    id: "mongodb",
    label: "Mongo",
    cx: 380,
    cy: 440,
    r: 20,
    domain: "data",
    rel: ["rabbitmq"],
  },
  {
    id: "redis",
    label: "Redis",
    cx: 200,
    cy: 360,
    r: 20,
    domain: "data",
    rel: ["celery"],
  },
  {
    id: "rabbitmq",
    label: "RabbitMQ",
    cx: 450,
    cy: 400,
    r: 22,
    domain: "data",
    rel: ["celery", "mongodb", "docker"],
  },

  // learning
  {
    id: "kubernetes",
    label: "Kubernetes",
    sub: "~70%",
    cx: 650,
    cy: 60,
    r: 22,
    domain: "learning",
    rel: ["docker", "ebpf"],
  },
  {
    id: "terraform",
    label: "Terraform",
    sub: "~50%",
    cx: 820,
    cy: 400,
    r: 20,
    domain: "learning",
    rel: ["aws"],
  },
  {
    id: "go",
    label: "Go",
    cx: 560,
    cy: 400,
    r: 20,
    domain: "learning",
    rel: ["sysdesign"],
  },
  {
    id: "ebpf",
    label: "eBPF",
    cx: 760,
    cy: 80,
    r: 20,
    domain: "learning",
    rel: ["kubernetes"],
  },
];

/** Edges: `[from, to]` lines. Duplicates of related pairs are deduped. */
const EDGES: ReadonlyArray<readonly [string, string]> = [
  ["django", "drf"],
  ["django", "celery"],
  ["django", "postgresql"],
  ["django", "sysdesign"],
  ["drf", "websocket"],
  ["celery", "rabbitmq"],
  ["celery", "redis"],
  ["rabbitmq", "mongodb"],
  ["rabbitmq", "docker"],
  ["docker", "aws"],
  ["docker", "kubernetes"],
  ["docker", "ffmpeg"],
  ["aws", "nginx"],
  ["aws", "cicd"],
  ["aws", "terraform"],
  ["sysdesign", "docker"],
  ["sysdesign", "aws"],
  ["sysdesign", "go"],
  ["kubernetes", "ebpf"],
  ["ffmpeg", "aws"],
];

/* ===========================================================================
   Section
   =========================================================================== */

export function SkillGraph() {
  return (
    <section id="stack" className="border-border scroll-mt-20 border-t py-[90px]">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-acc mb-2.5 font-mono text-[13px] tracking-[1px]">
            03 / DEPENDENCY GRAPH
          </p>
          <h2 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
            How the stack connects
          </h2>
          <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
            Not a list of logos. Hover a node to trace what it actually works with —
            including what I&apos;m actively leveling up.
          </p>
        </div>

        <SkillGraphPanel />
      </div>
    </section>
  );
}

function SkillGraphPanel() {
  return (
    <div className="bg-surface border-border rounded-[10px] border p-6">
      {/* Legend */}
      <div className="text-t3 mb-2 flex flex-wrap gap-6 font-mono text-[12px]">
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
              backgroundColor: "color-mix(in srgb, var(--t2) 50%, var(--code-bg))",
            }}
          />
          data layer
        </span>
        <span>
          <span className="border-t3 mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] border-dashed align-middle" />
          currently leveling up
        </span>
      </div>

      {/* Horizontally scrollable on small screens */}
      <div className="overflow-x-auto">
        {/* The viewBox matches the flat mockup (900x460). */}
        <svg
          id="skillGraph"
          className="skill-graph block w-full"
          viewBox="0 0 900 460"
          style={{ minWidth: 760, height: "auto" }}
          role="img"
          aria-label="Skill dependency graph: hover a node to trace connections."
        >
          {/* Edges */}
          <g className="edges">
            {EDGES.map(([a, b], i) => (
              <line
                key={i}
                className="skill-edge"
                data-edge={`${a},${b}`}
                x1={getNode(a).cx}
                y1={getNode(a).cy}
                x2={getNode(b).cx}
                y2={getNode(b).cy}
              />
            ))}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {NODES.map((n) => (
              <g
                key={n.id}
                className={`skill-node ${n.domain === "backend" ? "backend" : n.domain === "infra" ? "infra" : n.domain === "data" ? "data" : "learning"}`}
                data-id={n.id}
                data-rel={n.rel.join(",")}
                tabIndex={0}
                role="button"
                aria-label={`${n.label}${n.sub ? " " + n.sub : ""} — connected to ${n.rel.join(", ")}`}
              >
                <circle cx={n.cx} cy={n.cy} r={n.r} />
                <text x={n.cx} y={n.cy - (n.sub ? 4 : 0)}>
                  {n.label}
                </text>
                {n.sub ? (
                  <text x={n.cx} y={n.cy + 12} fontSize={9}>
                    {n.sub}
                  </text>
                ) : null}
              </g>
            ))}
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

/* ===========================================================================
   Hover interaction — vanilla JS via dangerouslySetInnerHTML-free script.
   Uses a <script> tag rendered inside the section; React hydrates nothing
   here. Hover behavior uses event delegation on the SVG.
   =========================================================================== */

declare global {
  interface Window {
    __attachSkillGraphHandlers?: () => void;
  }
}

export function SkillGraphScript() {
  const script = `
(function () {
  function attach() {
    var g = document.getElementById("skillGraph");
    if (!g || g.__skillGraphBound) return;
    g.__skillGraphBound = true;
    var nodes = g.querySelectorAll(".skill-node");
    var edges = g.querySelectorAll(".skill-edge");
    nodes.forEach(function (node) {
      function enter() {
        var id = node.getAttribute("data-id");
        var rel = (node.getAttribute("data-rel") || "")
          .split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        g.classList.add("has-active");
        nodes.forEach(function (n) {
          var nid = n.getAttribute("data-id");
          if (nid === id || rel.indexOf(nid) !== -1) n.classList.add("active");
        });
        edges.forEach(function (e) {
          var pair = (e.getAttribute("data-edge") || "").split(",");
          if (pair[0] === id || pair[1] === id) e.classList.add("active");
        });
      }
      function leave() {
        g.classList.remove("has-active");
        nodes.forEach(function (n) { n.classList.remove("active"); });
        edges.forEach(function (e) { e.classList.remove("active"); });
      }
      node.addEventListener("mouseenter", enter);
      node.addEventListener("mouseleave", leave);
      node.addEventListener("focus", enter);
      node.addEventListener("blur", leave);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attach);
  } else {
    attach();
  }
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

/* Export a tiny type re-export so the section consumer knows the STACK
 * dependency we kept (the registry is referenced for the legend & to
 * give the consumer a hook to extend the graph). */
export type { SkillNode };

/* silence unused-import warning while keeping the dependency explicit */
void STACK;
