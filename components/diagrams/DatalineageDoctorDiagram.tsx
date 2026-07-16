/**
 * components/diagrams/DatalineageDoctorDiagram.tsx
 *
 * Full architecture diagram for DataLineage Doctor. Shows the
 * OpenMetadata integration flow + iterative RCA agent loop.
 *
 * Layout: OpenMetadata (top) emits a testCaseFailed webhook → FastAPI
 * app enqueues a Celery task → worker runs the RCA agent which spins
 * through an iterative tool-calling loop (lineage / DQ / pipeline /
 * owners / blast radius / history) via the typed httpx OM client. The
 * agent writes structured findings to Postgres; the dashboard reads
 * them; the agent also closes the loop by writing findings back to
 * OpenMetadata via its Incident API.
 *
 * Animated packets (Phase 10 T10.3) — amber for the agent's tool-call
 * loop (Agent → tools → RCAReport), accent for the persistence +
 * close-the-loop paths (RCAReport → Postgres, Agent → Incident API,
 * OM client → OM).
 *
 * Pure SVG + SMIL, no JS.
 */

import { AnimatedPackets } from "./DiagramPackets";

export function DatalineageDoctorDiagram() {
  return (
    <svg
      viewBox="0 0 520 360"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 520, height: "auto", display: "block" }}
      role="img"
      aria-label="DataLineage Doctor: OpenMetadata webhook triggers RCA agent, which iteratively calls tools and writes a structured report."
    >
      <g aria-hidden>
        {/* ───── LEFT: OpenMetadata ───── */}
        <rect className="alg-mini-node alg-mini-base" x={12} y={20} width={120} height={42} rx={5} />
        <text className="alg-mini-label" x={72} y={42} textAnchor="middle" fontSize={11}>OpenMetadata</text>
        <text className="alg-sub" x={72} y={56} textAnchor="middle" fontSize={9}>lineage · DQ · owners</text>

        <rect className="alg-mini-node alg-mini-queue" x={12} y={88} width={120} height={34} rx={5} />
        <text className="alg-mini-label" x={72} y={110} textAnchor="middle" fontSize={11}>Webhook (testCaseFailed)</text>

        <rect className="alg-mini-node alg-mini-mauve" x={12} y={298} width={120} height={34} rx={5} />
        <text className="alg-mini-label" x={72} y={320} textAnchor="middle" fontSize={11}>Incident API (write-back)</text>

        {/* ───── MIDDLE-LEFT: FastAPI app ───── */}
        <rect className="alg-mini-node alg-mini-judge" x={158} y={88} width={108} height={34} rx={5} />
        <text className="alg-mini-label" x={212} y={110} textAnchor="middle" fontSize={11}>FastAPI app</text>

        <rect className="alg-mini-node alg-mini-base" x={158} y={136} width={108} height={34} rx={5} />
        <text className="alg-mini-label" x={212} y={158} textAnchor="middle" fontSize={11}>Dashboard (Jinja + Flow)</text>

        <rect className="alg-mini-node alg-mini-base" x={158} y={298} width={108} height={34} rx={5} />
        <text className="alg-mini-label" x={212} y={320} textAnchor="middle" fontSize={11}>/metrics (Prometheus)</text>

        {/* ───── MIDDLE: Celery + Redis ───── */}
        <rect className="alg-mini-node alg-mini-queue" x={290} y={88} width={108} height={34} rx={5} />
        <text className="alg-mini-label" x={344} y={110} textAnchor="middle" fontSize={11}>Celery + Redis broker</text>

        {/* ───── MIDDLE-RIGHT: RCA Agent + tool loop ───── */}
        <rect className="alg-mini-node alg-mini-judge" x={290} y={136} width={108} height={34} rx={5} />
        <text className="alg-mini-label" x={344} y={158} textAnchor="middle" fontSize={11}>RCA Agent (iterative)</text>

        {/* Tool icons grouped to the right */}
        <rect className="alg-mini-node alg-mini-base" x={290} y={184} width={108} height={22} rx={4} />
        <text className="alg-mini-label" x={344} y={199} textAnchor="middle" fontSize={9.5}>tool: lineage</text>

        <rect className="alg-mini-node alg-mini-base" x={290} y={210} width={108} height={22} rx={4} />
        <text className="alg-mini-label" x={344} y={225} textAnchor="middle" fontSize={9.5}>tool: DQ history</text>

        <rect className="alg-mini-node alg-mini-base" x={290} y={236} width={108} height={22} rx={4} />
        <text className="alg-mini-label" x={344} y={251} textAnchor="middle" fontSize={9.5}>tool: pipeline status</text>

        <rect className="alg-mini-node alg-mini-base" x={290} y={262} width={108} height={22} rx={4} />
        <text className="alg-mini-label" x={344} y={277} textAnchor="middle" fontSize={9.5}>tool: blast radius</text>

        <rect className="alg-mini-node alg-mini-base" x={290} y={288} width={108} height={22} rx={4} />
        <text className="alg-mini-label" x={344} y={303} textAnchor="middle" fontSize={9.5}>tool: incident history</text>

        {/* ───── RIGHT: OM client + report + DB ───── */}
        <rect className="alg-mini-node alg-mini-queue" x={420} y={88} width={90} height={34} rx={5} />
        <text className="alg-mini-label" x={465} y={110} textAnchor="middle" fontSize={10}>httpx OM client</text>

        <rect className="alg-mini-node alg-mini-mauve" x={420} y={136} width={90} height={34} rx={5} />
        <text className="alg-mini-label" x={465} y={158} textAnchor="middle" fontSize={10}>RCAReport (JSON)</text>

        <rect className="alg-mini-node alg-mini-data" x={420} y={220} width={90} height={42} rx={5} />
        <text className="alg-mini-label" x={465} y={242} textAnchor="middle" fontSize={10}>Postgres</text>
        <text className="alg-sub" x={465} y={256} textAnchor="middle" fontSize={8.5}>incidents · timeline</text>

        <rect className="alg-mini-node alg-mini-base" x={420} y={290} width={90} height={34} rx={5} />
        <text className="alg-mini-label" x={465} y={312} textAnchor="middle" fontSize={10}>Slack notifier</text>

        {/* ───── Edges (with IDs for AnimatedPackets) ───── */}
        {/* OM -> Webhook */}
        <path id="dld-p1" className="alg-mini-edge" d="M72 62 V88" />
        {/* Webhook -> FastAPI */}
        <path id="dld-p2" className="alg-mini-edge" d="M132 105 H158" />
        {/* FastAPI -> Celery */}
        <path id="dld-p3" className="alg-mini-edge" d="M266 105 H290" />
        {/* Celery -> Agent */}
        <path id="dld-p4" className="alg-mini-edge" d="M344 122 V136" />
        {/* Agent <-> tools */}
        <path id="dld-p5" className="alg-mini-edge" d="M344 170 V184" />
        <path id="dld-p6" className="alg-mini-edge" d="M344 206 V210" />
        <path id="dld-p7" className="alg-mini-edge" d="M344 232 V236" />
        <path id="dld-p8" className="alg-mini-edge" d="M344 258 V262" />
        <path id="dld-p9" className="alg-mini-edge" d="M344 284 V288" />
        {/* Agent -> OM client */}
        <path id="dld-p10" className="alg-mini-edge" d="M398 153 H420" />
        {/* OM client <-> OpenMetadata */}
        <path id="dld-p11" className="alg-mini-edge" d="M420 105 H132 V62" />
        {/* Agent -> RCAReport */}
        <path id="dld-p12" className="alg-mini-edge" d="M398 170 H420" />
        {/* RCAReport -> Postgres */}
        <path id="dld-p13" className="alg-mini-edge" d="M465 170 V220" />
        {/* RCAReport -> Slack */}
        <path id="dld-p14" className="alg-mini-edge" d="M465 170 V290" />
        {/* Agent -> write back to OM via Incident API */}
        <path id="dld-p15" className="alg-mini-edge" d="M398 153 Q280 280 132 315" />
        {/* Dashboard -> Postgres (read) */}
        <path className="alg-mini-edge" d="M266 153 H420" />
        {/* Prometheus -> App */}
        <path className="alg-mini-edge" d="M266 315 H158" />
      </g>

      {/* Animated packets — Phase 10 T10.3 */}
      <AnimatedPackets
        groups={[
          /* Tool-call loop: Agent ↔ tools. Amber packets signal the
             iterative RCA in flight — the agent calls each tool to
             gather evidence. One packet per tool edge. */
          {
            edges: ["dld-p5", "dld-p6", "dld-p7", "dld-p8", "dld-p9"],
            color: "amber",
            count: 4,
          },
          /* Persistence + close-the-loop: Agent → OM client → OM, Agent
             → RCAReport → Postgres, Agent → RCAReport → Slack. Accent
             packets signal findings being written back to the
             source-of-truth system. */
          {
            edges: ["dld-p10", "dld-p11", "dld-p12", "dld-p13", "dld-p14", "dld-p15"],
            color: "acc",
            count: 4,
          },
        ]}
      />
    </svg>
  );
}