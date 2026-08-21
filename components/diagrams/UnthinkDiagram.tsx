/**
 * components/diagrams/UnthinkDiagram.tsx
 *
 * Architecture diagram for the UnThink founder-tier card on /work and case study hero.
 * Micro-orchestration dual-backend pattern:
 *
 *   [Extension (MV3)] ──POST──→ [Django 5.1 :8000] ──enqueue──→ [Redis 7.2 Broker]
 *                                                                      │
 *                                                                      ▼
 *                                                            [Celery × 3 Queues]
 *                                                                      │
 *                                                                      ▼
 *   [Web App (React)] ◄──SSE─── [FastAPI :8001] ◄────stream──── [Fireworks / Gemini]
 *                                     │                                │
 *                                     ▼                                ▼
 *                            [PostgreSQL 16] ◄────────────── [Redis Cache (Epochs)]
 *
 * Animated packets:
 *   - Amber for the save / classify path: Extension → Django → Redis Broker → Celery → AI Engine.
 *   - Accent for the SSE real-time stream & cache persistence: AI Engine → FastAPI → Web App, and Celery → Cache/Postgres.
 *
 * Pure SVG + SMIL, no JS. Honors prefers-reduced-motion via the browser's automatic SMIL gate.
 */

import { AnimatedPackets } from "./DiagramPackets";

export function UnthinkDiagram() {
  return (
    <svg
      viewBox="0 0 320 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 320, height: "auto", display: "block" }}
      role="img"
      aria-label="UnThink: Chromium MV3 Extension to Django 5.1, 3 Celery queues, FastAPI SSE streaming with Gemini/Fireworks failover, and Redis epoch caching."
    >
      <g aria-hidden>
        {/* Browser Extension (top-left) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={8}
          y={10}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={54}
          y={30}
          textAnchor="middle"
          fontSize={9.5}
        >
          Extension (MV3)
        </text>

        {/* Web App / Dashboard (top-right) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={220}
          y={10}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={266}
          y={30}
          textAnchor="middle"
          fontSize={9.5}
        >
          Web App (React)
        </text>

        {/* Django 5.1 :8000 (left middle) */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={8}
          y={66}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={54}
          y={86}
          textAnchor="middle"
          fontSize={9.5}
        >
          Django 5.1 :8000
        </text>

        {/* Redis 7.2 Broker (center top) */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={114}
          y={66}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={160}
          y={86}
          textAnchor="middle"
          fontSize={9.5}
        >
          Redis Broker
        </text>

        {/* Celery × 3 Queues (center middle) */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={114}
          y={118}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={160}
          y={138}
          textAnchor="middle"
          fontSize={9.5}
        >
          Celery × 3 Queues
        </text>

        {/* FastAPI :8001 (right middle) */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={220}
          y={66}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={266}
          y={86}
          textAnchor="middle"
          fontSize={9.5}
        >
          FastAPI (SSE)
        </text>

        {/* AI Failover Engine (right bottom) */}
        <rect
          className="alg-mini-node alg-mini-mauve"
          x={220}
          y={118}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={266}
          y={138}
          textAnchor="middle"
          fontSize={9}
        >
          Fireworks / Gemini
        </text>

        {/* PostgreSQL 16 (bottom left-center) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={40}
          y={174}
          width={105}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={92}
          y={194}
          textAnchor="middle"
          fontSize={9.5}
        >
          PostgreSQL 16
        </text>

        {/* Redis Cache with Epoch Versioning (bottom right-center) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={175}
          y={174}
          width={105}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={227}
          y={194}
          textAnchor="middle"
          fontSize={9}
        >
          Redis Cache (Epochs)
        </text>

        {/* Edges */}
        {/* Extension → Django */}
        <path id="unthink-p1" className="alg-mini-edge" d="M54 42 V66" />
        {/* Django → Redis Broker */}
        <path id="unthink-p2" className="alg-mini-edge" d="M100 82 H114" />
        {/* Redis Broker → Celery */}
        <path id="unthink-p3" className="alg-mini-edge" d="M160 98 V118" />
        {/* Celery → AI Engine */}
        <path id="unthink-p4" className="alg-mini-edge" d="M206 134 H220" />
        {/* AI Engine → FastAPI */}
        <path id="unthink-p5" className="alg-mini-edge" d="M266 118 V98" />
        {/* FastAPI → Web App (SSE) */}
        <path id="unthink-p6" className="alg-mini-edge" d="M266 66 V42" />
        {/* Celery/Worker → PostgreSQL (persist) */}
        <path id="unthink-p7" className="alg-mini-edge" d="M130 150 Q105 162 92 174" />
        {/* Celery/Worker → Redis Cache (bump epoch) */}
        <path id="unthink-p8" className="alg-mini-edge" d="M190 150 Q215 162 227 174" />
      </g>

      {/* Animated packets */}
      <AnimatedPackets
        groups={[
          /* Ingestion & AI classify path */
          {
            edges: ["unthink-p1", "unthink-p2", "unthink-p3", "unthink-p4"],
            color: "amber",
            count: 3,
          },
          /* Real-time SSE stream & Persistence */
          {
            edges: ["unthink-p5", "unthink-p6"],
            color: "acc",
            count: 2,
          },
          {
            edges: ["unthink-p7", "unthink-p8"],
            color: "acc",
            count: 2,
          },
        ]}
      />
    </svg>
  );
}