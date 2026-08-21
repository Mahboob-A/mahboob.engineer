/**
 * components/diagrams/TaplyDiagram.tsx
 *
 * High-fidelity architecture diagram for the Taply founder-tier card on /work
 * and case study hero on /work/taply.
 *
 * System Architecture:
 *   [NFC Card / Dynamic QR] ──ingress──→ [Cloudflare Edge / V8] ──<80ms──→ [Django 5 Core API]
 *                                                                             │         │
 *                                                      ┌──────────────────────┴┐        └──────→ [Org Directory / SSO]
 *                                                      ▼                       ▼
 *                                            [Redis 7.2 HINCRBY]       [PostgreSQL 16]
 *                                                      │                       │
 *                                                      ▼                       ▼
 *                                            [RFC 6350 vCard]          [Celery Worker Sync] ──→ [HubSpot / Stripe]
 *
 * Animated packets (SMIL):
 *   - Amber for edge ingestion: NFC / QR -> Cloudflare -> Django -> Redis.
 *   - Accent (mint) for persistence, vCard generation, and webhook dispatch.
 *
 * Pure SVG + SMIL, 100% dependency-free, zero emojis, zero em dashes.
 */

import { AnimatedPackets } from "./DiagramPackets";

export function TaplyDiagram() {
  return (
    <svg
      viewBox="0 0 980 340"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="Taply: Hardware NFC and dynamic QR ingestion via Cloudflare Edge to Django 5 Core, Redis HINCRBY atomic counters, PostgreSQL multi-tenancy, and Celery CRM dispatch."
    >
      {/* ─── Edges (rendered under nodes) ────────────────────────── */}
      <g aria-hidden>
        {/* NFC Card -> Cloudflare Edge */}
        <path id="taply-p1" className="alg-edge" d="M 170 80 H 220" />
        {/* Dynamic QR -> Cloudflare Edge */}
        <path id="taply-p2" className="alg-edge" d="M 170 180 H 195 V 132 H 220" />
        {/* Cloudflare Edge -> Django Core API */}
        <path id="taply-p3" className="alg-edge" d="M 380 132 H 430" />
        {/* Django -> Redis (Top-Right) */}
        <path id="taply-p4" className="alg-edge" d="M 600 115 H 625 V 60 H 650" />
        {/* Django -> PostgreSQL (Middle-Right) */}
        <path id="taply-p5" className="alg-edge" d="M 600 145 H 650" />
        {/* Django -> Celery Workers (Bottom-Right) */}
        <path id="taply-p6" className="alg-edge" d="M 515 170 V 240 H 650" />
        {/* Redis -> RFC 6350 vCard Generator */}
        <path id="taply-p7" className="alg-edge" d="M 800 60 H 840" />
        {/* PostgreSQL -> Celery */}
        <path className="alg-edge" d="M 725 180 V 210" />
        {/* Celery -> HubSpot Webhook Dispatch */}
        <path id="taply-p8" className="alg-edge" d="M 800 240 H 820 V 150 H 840" />
        {/* Celery -> Stripe Webhooks */}
        <path id="taply-p9" className="alg-edge" d="M 800 240 H 840" />
        {/* Django -> Org Directory / SSO */}
        <path id="taply-p10" className="alg-edge" d="M 470 170 V 240" />
      </g>

      {/* ─── Nodes ───────────────────────────────────────────────── */}
      {/* 1. Client Hardware: NFC 13.56 MHz Card */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={20}
          y={50}
          width={150}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={95} y={75} textAnchor="middle">
          NFC Smart Card
        </text>
        <text className="alg-sub" x={95} y={92} textAnchor="middle">
          13.56 MHz · NTAG213
        </text>
      </g>

      {/* 2. Client Hardware: Dynamic QR Code */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={20}
          y={150}
          width={150}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={95} y={175} textAnchor="middle">
          Dynamic QR Code
        </text>
        <text className="alg-sub" x={95} y={192} textAnchor="middle">
          ISO/IEC 18004 · SVG
        </text>
      </g>

      {/* 3. Edge Routing Layer: Cloudflare V8 Workers */}
      <g>
        <rect
          className="alg-node alg-node-judge"
          x={220}
          y={95}
          width={160}
          height={75}
          rx={6}
        />
        <text className="alg-label" x={300} y={122} textAnchor="middle">
          Cloudflare Edge
        </text>
        <text className="alg-sub" x={300} y={138} textAnchor="middle">
          V8 Isolate Workers
        </text>
        <text className="alg-sub" x={300} y={152} textAnchor="middle">
          &lt;80ms SLA Routing
        </text>
      </g>

      {/* 4. Core Service: Django 5 + DRF Backend */}
      <g>
        <rect
          className="alg-node alg-node-judge"
          x={430}
          y={95}
          width={170}
          height={75}
          rx={6}
        />
        <text className="alg-label" x={515} y={122} textAnchor="middle">
          Django 5 Core API
        </text>
        <text className="alg-sub" x={515} y={138} textAnchor="middle">
          DRF · JWT Auth
        </text>
        <text className="alg-sub" x={515} y={152} textAnchor="middle">
          /p/&lt;username&gt; Resolver
        </text>
      </g>

      {/* 5. In-Memory Telemetry: Redis 7.2 */}
      <g>
        <rect
          className="alg-node alg-node-queue"
          x={650}
          y={30}
          width={150}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={725} y={55} textAnchor="middle">
          Redis 7.2 Cache
        </text>
        <text className="alg-sub" x={725} y={72} textAnchor="middle">
          HINCRBY Atomic Taps
        </text>
      </g>

      {/* 6. Primary Relational Store: PostgreSQL 16 */}
      <g>
        <rect
          className="alg-node alg-node-data"
          x={650}
          y={120}
          width={150}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={725} y={145} textAnchor="middle">
          PostgreSQL 16
        </text>
        <text className="alg-sub" x={725} y={162} textAnchor="middle">
          JSONB Profiles · Leads
        </text>
      </g>

      {/* 7. Async Worker Pool: Celery */}
      <g>
        <rect
          className="alg-node alg-node-queue"
          x={650}
          y={210}
          width={150}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={725} y={235} textAnchor="middle">
          Celery Workers
        </text>
        <text className="alg-sub" x={725} y={252} textAnchor="middle">
          Batch DB Sync · Queues
        </text>
      </g>

      {/* 8. RFC 6350 vCard Generator */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={840}
          y={30}
          width={120}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={900} y={55} textAnchor="middle">
          vCard 4.0
        </text>
        <text className="alg-sub" x={900} y={72} textAnchor="middle">
          RFC 6350 Payload
        </text>
      </g>

      {/* 9. HubSpot / CRM Dispatch */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={840}
          y={120}
          width={120}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={900} y={145} textAnchor="middle">
          HubSpot CRM
        </text>
        <text className="alg-sub" x={900} y={162} textAnchor="middle">
          Webhook Stream
        </text>
      </g>

      {/* 10. Stripe Billing Sidecar */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={840}
          y={210}
          width={120}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={900} y={235} textAnchor="middle">
          Stripe Billing
        </text>
        <text className="alg-sub" x={900} y={252} textAnchor="middle">
          Webhook Ingestion
        </text>
      </g>

      {/* 11. Multi-Tenant Org Directory / SSO */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={390}
          y={240}
          width={160}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={470} y={265} textAnchor="middle">
          Multi-Tenant Org
        </text>
        <text className="alg-sub" x={470} y={282} textAnchor="middle">
          Enterprise SSO / SAML
        </text>
      </g>

      {/* ─── Animated Packets (SMIL) ──────────────────────────────── */}
      <AnimatedPackets
        groups={[
          {
            edges: ["taply-p1", "taply-p2", "taply-p3", "taply-p4"],
            color: "amber",
            count: 4,
          },
          {
            edges: ["taply-p5", "taply-p6", "taply-p7", "taply-p8", "taply-p9", "taply-p10"],
            color: "acc",
            count: 5,
          },
        ]}
      />
    </svg>
  );
}