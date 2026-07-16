/**
 * components/diagrams/ProstreamDiagram.tsx
 *
 * Mini architecture diagram for the ProStream showcase-tier card.
 * Live streaming: streamer broadcasts via Agora SD-RTN → Django
 * Channels + Redis Pub/Sub for chat / viewer sync → React frontend.
 * Wallet + tipping via SSLCommerz on the Django API.
 *
 * Pure SVG, viewBox 480x200. Phase 9 (T9.3).
 */

export function ProstreamDiagram() {
  return (
    <svg
      viewBox="0 0 480 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "100%",
        maxWidth: 480,
        height: "auto",
        display: "block",
      }}
      role="img"
      aria-label="ProStream: streamer broadcasts through Agora SD-RTN; Django Channels + Redis Pub/Sub sync chat and viewer counts; React frontend; tipping via SSLCommerz."
    >
      <g aria-hidden>
        {/* Streamer */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={10}
          y={70}
          width={66}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={43}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Streamer
        </text>

        {/* Agora SD-RTN */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={100}
          y={70}
          width={86}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={143}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Agora SD-RTN
        </text>

        {/* Django + DRF API */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={208}
          y={70}
          width={86}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={251}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Django API
        </text>

        {/* Django Channels + Redis */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={318}
          y={70}
          width={74}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={355}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Channels
        </text>

        {/* React Frontend */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={416}
          y={70}
          width={54}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={443}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          React
        </text>

        {/* SSLCommerz (bottom) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={208}
          y={140}
          width={86}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={251}
          y={159}
          textAnchor="middle"
          fontSize={10}
        >
          SSLCommerz
        </text>

        {/* Postgres (bottom) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={318}
          y={140}
          width={74}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={355}
          y={159}
          textAnchor="middle"
          fontSize={10}
        >
          Postgres
        </text>

        {/* Viewer (bottom-right) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={416}
          y={140}
          width={54}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={443}
          y={159}
          textAnchor="middle"
          fontSize={10}
        >
          Viewer
        </text>

        {/* Edges */}
        {/* Streamer → Agora */}
        <path className="alg-mini-edge" d="M76 86 H100" />
        {/* Agora → Django API (token validation + viewer count) */}
        <path className="alg-mini-edge" d="M186 86 H208" />
        {/* Django API → Channels (chat fan-out) */}
        <path className="alg-mini-edge" d="M294 86 H318" />
        {/* Channels → React */}
        <path className="alg-mini-edge" d="M392 86 H416" />
        {/* React → Viewer (read) */}
        <path className="alg-mini-edge" d="M443 102 V140" />
        {/* Django API → SSLCommerz (tip payout) */}
        <path className="alg-mini-edge" d="M251 102 V140" />
        {/* Django API → Postgres */}
        <path className="alg-mini-edge" d="M280 102 Q300 130 318 156" />
      </g>
    </svg>
  );
}