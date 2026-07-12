/**
 * components/diagrams/TaplyDiagram.tsx
 *
 * Mini architecture diagram for the Taply founder-tier card on /work.
 * 7 nodes laid out as a SaaS funnel: client → nginx → Django + 3
 * sidecar services (Redis, Postgres, Stripe).
 *
 * All colors come from CSS vars in data/tokens.ts (via diagrams.css).
 * Static SVG — no animation, no JS. Will be elaborated into a full
 * architecture diagram for /work/taply (T3.3) case-study page.
 */

export function TaplyDiagram() {
  return (
    <svg
      viewBox="0 0 320 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 320, height: "auto", display: "block" }}
      role="img"
      aria-label="Taply: client to nginx to Django with Redis, PostgreSQL, and Stripe sidecars."
    >
      <g aria-hidden>
        {/* Client (top-left) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={10}
          y={10}
          width={88}
          height={36}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={54}
          y={32}
          textAnchor="middle"
          fontSize={10.5}
        >
          Browser / NFC
        </text>

        {/* Nginx (middle-top) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={116}
          y={10}
          width={88}
          height={36}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={160}
          y={32}
          textAnchor="middle"
          fontSize={10.5}
        >
          Nginx
        </text>

        {/* Django API + DRF (center) */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={116}
          y={80}
          width={88}
          height={36}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={160}
          y={102}
          textAnchor="middle"
          fontSize={10.5}
        >
          Django + DRF
        </text>

        {/* Redis (right top) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={222}
          y={10}
          width={88}
          height={36}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={266}
          y={32}
          textAnchor="middle"
          fontSize={10.5}
        >
          Redis
        </text>

        {/* PostgreSQL (right middle) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={222}
          y={80}
          width={88}
          height={36}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={266}
          y={102}
          textAnchor="middle"
          fontSize={10.5}
        >
          PostgreSQL
        </text>

        {/* Stripe (right bottom) */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={222}
          y={150}
          width={88}
          height={36}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={266}
          y={172}
          textAnchor="middle"
          fontSize={10.5}
        >
          Stripe
        </text>

        {/* vCard / Lead Capture (left bottom) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={10}
          y={150}
          width={88}
          height={36}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={54}
          y={172}
          textAnchor="middle"
          fontSize={10.5}
        >
          vCard + Leads
        </text>

        {/* Edges */}
        {/* Client → Nginx */}
        <path className="alg-mini-edge" d="M98 28 H116" />
        {/* Nginx → Django */}
        <path className="alg-mini-edge" d="M160 46 V80" />
        {/* Django → Redis (cache lookup) */}
        <path className="alg-mini-edge" d="M204 90 H222" />
        {/* Django → PostgreSQL (persistence) */}
        <path className="alg-mini-edge" d="M204 98 H222" />
        {/* Django → Stripe (billing) */}
        <path className="alg-mini-edge" d="M204 106 Q213 130 222 168" />
        {/* Django → vCard (response) */}
        <path className="alg-mini-edge" d="M116 98 Q70 120 54 150" />
      </g>
    </svg>
  );
}