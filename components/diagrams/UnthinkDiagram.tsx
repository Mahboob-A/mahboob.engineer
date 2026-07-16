/**
 * components/diagrams/UnthinkDiagram.tsx
 *
 * Mini architecture diagram for the UnThink founder-tier card on /work.
 * 8 nodes laid out as a dual-backend pattern:
 *
 *   [Extension] ──POST──→ [Django :8000] ──enqueue──→ [Redis broker]
 *                                                        │
 *                                                        ▼
 *                                              [Celery × 3 queues]
 *                                                        │
 *                                                        ▼
 *                              [FastAPI :8001 ← Gemini Flash]
 *
 *   [Dashboard] ──SSE──→ [FastAPI :8001] ──sub──→ [Redis pub/sub]
 *                                                        │
 *                                                        ▼
 *                                                   [Postgres]
 *
 * Animated packets (Phase 10 T10.2):
 *   - Amber for the save path: Extension → Django → Redis → Celery →
 *     FastAPI → Gemini. The LLM call surface; in-flight every time
 *     the user right-clicks "Send to UnThink".
 *   - Accent for the SSE stream: FastAPI → Dashboard. Real-time
 *     classification results.
 *
 * Pure SVG + SMIL, no JS. Honors prefers-reduced-motion via the
 * browser's automatic SMIL gate.
 */

import { AnimatedPackets } from "./DiagramPackets";

export function UnthinkDiagram() {
  return (
    <svg
      viewBox="0 0 320 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 320, height: "auto", display: "block" }}
      role="img"
      aria-label="UnThink: extension to Django, Celery to FastAPI with Gemini, SSE to dashboard."
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
          fontSize={10}
        >
          Extension
        </text>

        {/* Dashboard (top-right) */}
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
          fontSize={10}
        >
          Dashboard
        </text>

        {/* Django :8000 (left middle) */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={8}
          y={68}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={54}
          y={88}
          textAnchor="middle"
          fontSize={10}
        >
          Django :8000
        </text>

        {/* Redis broker (center top) */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={114}
          y={68}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={160}
          y={88}
          textAnchor="middle"
          fontSize={10}
        >
          Redis broker
        </text>

        {/* Celery worker (center middle) */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={114}
          y={114}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={160}
          y={134}
          textAnchor="middle"
          fontSize={10}
        >
          Celery × 3
        </text>

        {/* FastAPI :8001 (right middle) */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={220}
          y={91}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={266}
          y={111}
          textAnchor="middle"
          fontSize={10}
        >
          FastAPI :8001
        </text>

        {/* Gemini (right top of FastAPI) */}
        <rect
          className="alg-mini-node alg-mini-mauve"
          x={220}
          y={148}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={266}
          y={168}
          textAnchor="middle"
          fontSize={10}
        >
          Gemini Flash
        </text>

        {/* PostgreSQL (bottom center) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={114}
          y={170}
          width={92}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={160}
          y={190}
          textAnchor="middle"
          fontSize={10}
        >
          PostgreSQL
        </text>

        {/* Edges (with IDs for AnimatedPackets) */}
        {/* Extension → Django */}
        <path id="unthink-p1" className="alg-mini-edge" d="M54 42 V68" />
        {/* Dashboard → FastAPI (SSE) */}
        <path id="unthink-p2" className="alg-mini-edge" d="M266 42 V91" />
        {/* Django → Redis (enqueue) */}
        <path id="unthink-p3" className="alg-mini-edge" d="M100 84 H114" />
        {/* Redis → Celery */}
        <path id="unthink-p4" className="alg-mini-edge" d="M160 100 V114" />
        {/* Celery → FastAPI (call /ai/classify/) */}
        <path id="unthink-p5" className="alg-mini-edge" d="M206 130 H220" />
        {/* FastAPI → Gemini (LLM call) */}
        <path id="unthink-p6" className="alg-mini-edge" d="M266 123 V148" />
        {/* FastAPI → PostgreSQL (read-only — falls back as the
            "results persisted" surface; the cycle animates end-to-end
            from Gemini through Postgres back to Postgres-backed. The
            actual data plane returns via Redis pub/sub.) */}
        <path
          id="unthink-p7"
          className="alg-mini-edge"
          d="M220 110 Q170 150 160 170"
        />
      </g>

      {/* Animated packets — Phase 10 T10.2 */}
      <AnimatedPackets
        groups={[
          /* Save path: Extension → Django → Redis → Celery → FastAPI
             → Gemini. Amber packets signal the in-flight save /
             classify request. The LLM call takes the longest, so
             fewer packets on that stage. */
          {
            edges: ["unthink-p1", "unthink-p3", "unthink-p4", "unthink-p5", "unthink-p6"],
            color: "amber",
            count: 3,
          },
          /* Persistence + SSE: FastAPI → Postgres (write back the
             classified resource). Accent packets signal the result
             path. */
          { edges: ["unthink-p7"], color: "acc", count: 2 },
        ]}
      />
    </svg>
  );
}