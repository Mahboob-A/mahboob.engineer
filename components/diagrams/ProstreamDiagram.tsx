/**
 * components/diagrams/ProstreamDiagram.tsx
 *
 * Mini architecture diagram for the ProStream showcase-tier card.
 * Live streaming: streamer broadcasts via Agora SD-RTN → Django
 * Channels + Redis Pub/Sub for chat / viewer sync → React frontend.
 * Wallet + tipping via SSLCommerz on the Django API.
 *
 * Animated packets (Phase 10 T10.5):
 *   - Amber for the live-stream path: Streamer → Agora → Django API →
 *     Channels → React → Viewer. The actual broadcast flow.
 *   - Accent for the persistence + monetization path: Django API →
 *     Postgres (chat persistence, viewer counts) and Django API →
 *     SSLCommerz (tip payouts).
 *
 * Pure SVG, viewBox 480x200. Phase 9 (T9.3) authored, Phase 10
 * (T10.5) animated.
 */

import { AnimatedPackets } from "./DiagramPackets";

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

        {/* Edges (with IDs for AnimatedPackets) */}
        {/* Streamer → Agora */}
        <path id="prostream-p1" className="alg-mini-edge" d="M76 86 H100" />
        {/* Agora → Django API (token validation + viewer count) */}
        <path id="prostream-p2" className="alg-mini-edge" d="M186 86 H208" />
        {/* Django API → Channels (chat fan-out) */}
        <path id="prostream-p3" className="alg-mini-edge" d="M294 86 H318" />
        {/* Channels → React */}
        <path id="prostream-p4" className="alg-mini-edge" d="M392 86 H416" />
        {/* React → Viewer (read) */}
        <path id="prostream-p5" className="alg-mini-edge" d="M443 102 V140" />
        {/* Django API → SSLCommerz (tip payout) */}
        <path id="prostream-p6" className="alg-mini-edge" d="M251 102 V140" />
        {/* Django API → Postgres */}
        <path id="prostream-p7" className="alg-mini-edge" d="M280 102 Q300 130 318 156" />
      </g>

      {/* Animated packets — Phase 10 T10.5 */}
      <AnimatedPackets
        groups={[
          /* Live-stream path. Amber packets signal the broadcast
             flowing from Streamer → Agora → API → Channels → React
             → Viewer. The real-time path. */
          {
            edges: ["prostream-p1", "prostream-p2", "prostream-p3", "prostream-p4", "prostream-p5"],
            color: "amber",
            count: 4,
          },
          /* Persistence + monetization. Accent packets ride the
             Django API → Postgres (chat + viewer state) and API →
             SSLCommerz (tip payout) edges. */
          { edges: ["prostream-p6", "prostream-p7"], color: "acc", count: 2 },
        ]}
      />
    </svg>
  );
}