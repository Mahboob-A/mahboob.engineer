/**
 * components/diagrams/UnthinkDiagram.tsx
 *
 * High-fidelity architecture diagram for the UnThink founder-tier card on /work
 * and case study hero on /work/unthink.
 *
 * System Architecture:
 *   [Chromium MV3] ──capture──→ [Django 5.1 API :8000] ──enqueue──→ [Redis 7.2 Broker]
 *                                     │                                    │
 *                                     │                                    ▼
 *                                     │                          [Celery × 3 Queues]
 *                                     │                                    │
 *                                     │                                    ▼
 *                                     │                          [Dual-AI Model Router]
 *                                     │                                    │
 *                                     │                                    ▼
 *   [PostgreSQL 16] ◄────────[Redis Epoch Cache] ◄────────────── [FastAPI :8001 (SSE)] ──→ [React Web App]
 *
 * Animated packets (SMIL):
 *   - Amber for the save / classify path: Extension -> Django -> Redis Broker -> Celery -> Dual AI.
 *   - Accent (mint) for SSE streaming: Dual AI -> FastAPI -> React Web App, and Celery -> Storage.
 *
 * Pure SVG + SMIL, 100% dependency-free, zero emojis, zero em dashes.
 */

import { AnimatedPackets } from "./DiagramPackets";

export function UnthinkDiagram() {
  return (
    <svg
      viewBox="0 0 980 340"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="UnThink: Chromium MV3 Extension to Django 5.1 API, 3 Celery queues, Dual AI Model Router with Fireworks failover, FastAPI SSE streaming, and Redis epoch caching."
    >
      {/* ─── Edges (rendered under nodes) ────────────────────────── */}
      <g aria-hidden>
        {/* MV3 Extension -> Django API */}
        <path id="unthink-p1" className="alg-edge" d="M 180 80 H 230" />
        {/* Trafilatura -> Django API */}
        <path id="unthink-p2" className="alg-edge" d="M 180 180 H 205 V 132 H 230" />
        {/* Django API -> Redis Broker (Top) */}
        <path id="unthink-p3" className="alg-edge" d="M 400 115 H 425 V 60 H 450" />
        {/* Redis Broker -> Celery Workers */}
        <path id="unthink-p4" className="alg-edge" d="M 525 90 V 120" />
        {/* Celery -> Dual AI Router */}
        <path id="unthink-p5" className="alg-edge" d="M 600 145 H 625 V 65 H 650" />
        {/* Dual AI Router -> FastAPI SSE Streamer */}
        <path id="unthink-p6" className="alg-edge" d="M 730 105 V 140" />
        {/* FastAPI SSE -> React Web App */}
        <path id="unthink-p7" className="alg-edge" d="M 810 172 H 850" />
        {/* Celery -> PostgreSQL Persistence */}
        <path id="unthink-p8" className="alg-edge" d="M 450 160 H 425 V 265 H 400" />
        {/* Celery -> Redis Epoch Cache */}
        <path id="unthink-p9" className="alg-edge" d="M 525 195 V 235" />
        {/* Django -> PostgreSQL */}
        <path className="alg-edge" d="M 315 170 V 235" />
        {/* Redis Epoch Cache -> PostgreSQL */}
        <path className="alg-edge" d="M 450 265 H 400" />
      </g>

      {/* ─── Nodes ───────────────────────────────────────────────── */}
      {/* 1. Client Extension: Chromium Manifest V3 */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={20}
          y={50}
          width={160}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={100} y={75} textAnchor="middle">
          Extension (MV3)
        </text>
        <text className="alg-sub" x={100} y={92} textAnchor="middle">
          Context Menu · Hotkey
        </text>
      </g>

      {/* 2. DOM Parser: Trafilatura Content Extractor */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={20}
          y={150}
          width={160}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={100} y={175} textAnchor="middle">
          Trafilatura Parser
        </text>
        <text className="alg-sub" x={100} y={192} textAnchor="middle">
          Clean Article Extractor
        </text>
      </g>

      {/* 3. Core Ingestion API: Django 5.1 (:8000) */}
      <g>
        <rect
          className="alg-node alg-node-judge"
          x={230}
          y={95}
          width={170}
          height={75}
          rx={6}
        />
        <text className="alg-label" x={315} y={122} textAnchor="middle">
          Django 5.1 API
        </text>
        <text className="alg-sub" x={315} y={138} textAnchor="middle">
          DRF · JWT Auth
        </text>
        <text className="alg-sub" x={315} y={152} textAnchor="middle">
          POST /api/v1/capture
        </text>
      </g>

      {/* 4. Priority Broker: Redis 7.2 */}
      <g>
        <rect
          className="alg-node alg-node-queue"
          x={450}
          y={30}
          width={150}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={525} y={55} textAnchor="middle">
          Redis 7.2 Broker
        </text>
        <text className="alg-sub" x={525} y={72} textAnchor="middle">
          Task Distribution Bus
        </text>
      </g>

      {/* 5. Distributed Task Queues: Celery × 3 */}
      <g>
        <rect
          className="alg-node alg-node-queue"
          x={450}
          y={120}
          width={150}
          height={75}
          rx={6}
        />
        <text className="alg-label" x={525} y={145} textAnchor="middle">
          Celery × 3 Queues
        </text>
        <text className="alg-sub" x={525} y={162} textAnchor="middle">
          ai_urgent · default
        </text>
        <text className="alg-sub" x={525} y={176} textAnchor="middle">
          bulk entity indexing
        </text>
      </g>

      {/* 6. Dual-AI Model Router: Gemini 1.5 + Fireworks Failover */}
      <g>
        <rect
          className="alg-node alg-node-judge"
          x={650}
          y={30}
          width={160}
          height={75}
          rx={6}
        />
        <text className="alg-label" x={730} y={57} textAnchor="middle">
          Dual-AI Model Router
        </text>
        <text className="alg-sub" x={730} y={74} textAnchor="middle">
          Gemini 1.5 Flash
        </text>
        <text className="alg-sub" x={730} y={88} textAnchor="middle">
          Fireworks AI Failover
        </text>
      </g>

      {/* 7. Real-Time Streaming Layer: FastAPI (:8001) */}
      <g>
        <rect
          className="alg-node alg-node-judge"
          x={650}
          y={140}
          width={160}
          height={65}
          rx={6}
        />
        <text className="alg-label" x={730} y={165} textAnchor="middle">
          FastAPI (SSE)
        </text>
        <text className="alg-sub" x={730} y={182} textAnchor="middle">
          Async Token Generator
        </text>
      </g>

      {/* 8. Web App: React Dashboard & Knowledge Graph */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={850}
          y={85}
          width={110}
          height={120}
          rx={6}
        />
        <text className="alg-label" x={905} y={115} textAnchor="middle">
          React Web App
        </text>
        <text className="alg-sub" x={905} y={135} textAnchor="middle">
          Live SSE Reader
        </text>
        <text className="alg-sub" x={905} y={152} textAnchor="middle">
          Obsidian Graph
        </text>
        <text className="alg-sub" x={905} y={169} textAnchor="middle">
          Instant Search
        </text>
      </g>

      {/* 9. Relational Entity Store: PostgreSQL 16 */}
      <g>
        <rect
          className="alg-node alg-node-data"
          x={230}
          y={235}
          width={170}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={315} y={260} textAnchor="middle">
          PostgreSQL 16
        </text>
        <text className="alg-sub" x={315} y={277} textAnchor="middle">
          Knowledge Items · Graph
        </text>
      </g>

      {/* 10. In-Memory Cache: Redis Epoch Invalidation */}
      <g>
        <rect
          className="alg-node alg-node-queue"
          x={450}
          y={235}
          width={150}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={525} y={260} textAnchor="middle">
          Redis Epoch Cache
        </text>
        <text className="alg-sub" x={525} y={277} textAnchor="middle">
          user:&lt;id&gt;:epoch:N
        </text>
      </g>

      {/* ─── Animated Packets (SMIL) ──────────────────────────────── */}
      <AnimatedPackets
        groups={[
          {
            edges: ["unthink-p1", "unthink-p2", "unthink-p3", "unthink-p4", "unthink-p5"],
            color: "amber",
            count: 5,
          },
          {
            edges: ["unthink-p6", "unthink-p7", "unthink-p8", "unthink-p9"],
            color: "acc",
            count: 4,
          },
        ]}
      />
    </svg>
  );
}