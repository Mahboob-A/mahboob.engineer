/**
 * components/diagrams/TaplyDiagram.tsx
 *
 * Mini architecture diagram for the Taply founder-tier card on /work.
 * 7 nodes laid out as a SaaS funnel: client → nginx → Django + 3
 * sidecar services (Redis, Postgres, Stripe).
 *
 * Animated packets (Phase 10 T10.1) — amber for the ingress request
 * (Browser → Nginx → Django), accent for the persistence + response
 * paths (Django → Redis/Postgres, Django → Stripe, Django → vCard).
 *
 * Pure SVG + SMIL, no JS. Honors prefers-reduced-motion via the
 * browser's automatic SMIL gate.
 */

import { AnimatedPackets } from "./DiagramPackets";

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

        {/* Edges (with IDs for AnimatedPackets) */}
        {/* Client → Nginx */}
        <path id="taply-p1" className="alg-mini-edge" d="M98 28 H116" />
        {/* Nginx → Django */}
        <path id="taply-p2" className="alg-mini-edge" d="M160 46 V80" />
        {/* Django → Redis (cache lookup) */}
        <path id="taply-p3" className="alg-mini-edge" d="M204 90 H222" />
        {/* Django → PostgreSQL (persistence) */}
        <path id="taply-p4" className="alg-mini-edge" d="M204 98 H222" />
        {/* Django → Stripe (billing) */}
        <path id="taply-p5" className="alg-mini-edge" d="M204 106 Q213 130 222 168" />
        {/* Django → vCard (response) */}
        <path id="taply-p6" className="alg-mini-edge" d="M116 98 Q70 120 54 150" />
      </g>

      {/* Animated packets — Phase 10 T10.1 */}
      <AnimatedPackets
        groups={[
          /* Ingress: tap/QR request flows from the browser through
             Nginx into Django. Amber = in-flight request. */
          { edges: ["taply-p1", "taply-p2"], color: "amber", count: 2 },
          /* Persistence + response: Django reads from Redis (cache),
             writes to Postgres, bills via Stripe, returns vCard. Accent
             = resolved / persisted flow. */
          {
            edges: ["taply-p3", "taply-p4", "taply-p5", "taply-p6"],
            color: "acc",
            count: 3,
          },
        ]}
      />
    </svg>
  );
}