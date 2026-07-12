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
 * All colors from CSS vars in data/tokens.ts (via diagrams.css).
 * Static SVG — no animation, no JS. Will be elaborated for /work/unthink
 * case-study page in T3.3.
 */

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

        {/* Edges */}
        {/* Extension → Django */}
        <path className="alg-mini-edge" d="M54 42 V68" />
        {/* Dashboard → FastAPI (SSE) */}
        <path className="alg-mini-edge" d="M266 42 V91" />
        {/* Django → Redis (enqueue) */}
        <path className="alg-mini-edge" d="M100 84 H114" />
        {/* Redis → Celery */}
        <path className="alg-mini-edge" d="M160 100 V114" />
        {/* Celery → FastAPI (call /ai/classify/) */}
        <path className="alg-mini-edge" d="M206 130 H220" />
        {/* FastAPI → Gemini (LLM call) */}
        <path className="alg-mini-edge" d="M266 123 V148" />
        {/* FastAPI → PostgreSQL (read-only) */}
        <path className="alg-mini-edge" d="M220 110 Q170 150 160 170" />
      </g>
    </svg>
  );
}