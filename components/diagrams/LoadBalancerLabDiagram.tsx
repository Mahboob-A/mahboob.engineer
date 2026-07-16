/**
 * components/diagrams/LoadBalancerLabDiagram.tsx
 *
 * Mini architecture diagram for the Load Balancer Lab showcase-tier
 * card. Round-robin / weighted Nginx load balancer fronting 3
 * upstream app containers, with health-check /test endpoint.
 *
 * Animated packets (Phase 10 T10.5):
 *   - Amber for the request path: Client → Nginx LB → App-1 / App-2 /
 *     App-3. Cycles through the upstreams so each App gets a packet
 *     per rotation.
 *   - Accent for the health-check path: App → /test. The lighter
 *     heartbeat that verifies each App is alive.
 *
 * Pure SVG, viewBox 480x200. Phase 9 (T9.3) authored, Phase 10
 * (T10.5) animated.
 */

import { AnimatedPackets } from "./DiagramPackets";

export function LoadBalancerLabDiagram() {
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
      aria-label="Load Balancer Lab: Nginx load balancer distributes traffic across three upstream app containers using round-robin / weighted strategies."
    >
      <g aria-hidden>
        {/* Client */}
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
          Client
        </text>

        {/* Nginx LB */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={104}
          y={70}
          width={108}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={158}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Nginx LB
        </text>

        {/* Upstream 1 */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={240}
          y={20}
          width={94}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={287}
          y={39}
          textAnchor="middle"
          fontSize={10}
        >
          App-1
        </text>

        {/* Upstream 2 */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={240}
          y={70}
          width={94}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={287}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          App-2
        </text>

        {/* Upstream 3 */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={240}
          y={120}
          width={94}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={287}
          y={139}
          textAnchor="middle"
          fontSize={10}
        >
          App-3
        </text>

        {/* /test health endpoint label */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={360}
          y={70}
          width={108}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={414}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          /test
        </text>

        {/* Strategy label */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={360}
          y={120}
          width={108}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={414}
          y={139}
          textAnchor="middle"
          fontSize={10}
        >
          Round-robin
        </text>

        {/* Edges (with IDs for AnimatedPackets) */}
        {/* Client → Nginx */}
        <path id="lb-p1" className="alg-mini-edge" d="M76 86 H104" />
        {/* Nginx → App-1 */}
        <path id="lb-p2" className="alg-mini-edge" d="M212 78 Q225 50 240 36" />
        {/* Nginx → App-2 */}
        <path id="lb-p3" className="alg-mini-edge" d="M212 86 H240" />
        {/* Nginx → App-3 */}
        <path id="lb-p4" className="alg-mini-edge" d="M212 94 Q225 110 240 136" />
        {/* App-1 → /test */}
        <path id="lb-p5" className="alg-mini-edge" d="M334 36 H360" />
        {/* App-2 → /test */}
        <path id="lb-p6" className="alg-mini-edge" d="M334 86 H360" />
        {/* App-3 → /test */}
        <path id="lb-p7" className="alg-mini-edge" d="M334 136 H360" />
      </g>

      {/* Animated packets — Phase 10 T10.5 */}
      <AnimatedPackets
        groups={[
          /* Request distribution. Amber packets ride the Client →
             Nginx LB → App-N cycle so the round-robin behavior is
             visible at a glance. One packet per upstream edge keeps
             all three routes active. */
          {
            edges: ["lb-p1", "lb-p2", "lb-p3", "lb-p4"],
            color: "amber",
            count: 4,
          },
          /* Health checks. Accent packets ride the App → /test path;
             one per upstream so each App is being probed continuously. */
          { edges: ["lb-p5", "lb-p6", "lb-p7"], color: "acc", count: 1 },
        ]}
      />
    </svg>
  );
}