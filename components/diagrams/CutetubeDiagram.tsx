/**
 * components/diagrams/CutetubeDiagram.tsx
 *
 * Mini architecture diagram for the CuteTube showcase-tier card.
 * Video upload pipeline: browser upload → Django + DRF → Celery +
 * FFmpeg → S3 (HLS/DASH) → Gcore CDN → viewer.
 *
 * Pure SVG, viewBox 480x200 — fits the 180px-tall featured card slot
 * (`width: 100%` capped by the slot).
 *
 * Animated packets (Phase 10 T10.5):
 *   - Amber for the upload + transcode flow (Browser → Django →
 *     Celery → FFmpeg → S3). The pipeline that turns a raw upload
 *     into adaptive-bitrate DASH segments.
 *   - Accent for the delivery flow (CDN → Viewers). The watched-
 *     video path.
 *
 * Phase 9 (T9.3) authored, Phase 10 (T10.5) animated.
 */

import { AnimatedPackets } from "./DiagramPackets";

export function CutetubeDiagram() {
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
      aria-label="CuteTube: upload through Django, Celery transcodes via FFmpeg to S3, Gcore CDN serves to viewers."
    >
      <g aria-hidden>
        {/* Browser / Upload */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={10}
          y={70}
          width={70}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={45}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Browser
        </text>

        {/* Django + DRF */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={110}
          y={70}
          width={84}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={152}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Django + DRF
        </text>

        {/* Celery */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={222}
          y={70}
          width={70}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={257}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Celery
        </text>

        {/* FFmpeg Worker */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={322}
          y={70}
          width={86}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={365}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          FFmpeg
        </text>

        {/* S3 + Gcore CDN */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={430}
          y={20}
          width={70}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={465}
          y={39}
          textAnchor="middle"
          fontSize={10}
        >
          S3
        </text>
        <rect
          className="alg-mini-node alg-mini-data"
          x={430}
          y={70}
          width={70}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={465}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Gcore CDN
        </text>

        {/* Postgres (bottom-left) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={110}
          y={140}
          width={84}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={152}
          y={159}
          textAnchor="middle"
          fontSize={10}
        >
          Postgres
        </text>

        {/* Celery Worker (bottom-row) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={222}
          y={140}
          width={70}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={257}
          y={159}
          textAnchor="middle"
          fontSize={10}
        >
          Worker
        </text>

        {/* Viewers (bottom-right) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={430}
          y={140}
          width={70}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={465}
          y={159}
          textAnchor="middle"
          fontSize={10}
        >
          Viewers
        </text>

        {/* Edges (with IDs for AnimatedPackets) */}
        {/* Browser → Django */}
        <path id="cutetube-p1" className="alg-mini-edge" d="M80 86 H110" />
        {/* Django → Celery */}
        <path id="cutetube-p2" className="alg-mini-edge" d="M194 86 H222" />
        {/* Celery → FFmpeg */}
        <path id="cutetube-p3" className="alg-mini-edge" d="M292 86 H322" />
        {/* FFmpeg → S3 (upload segments) */}
        <path id="cutetube-p4" className="alg-mini-edge" d="M408 86 H430" />
        {/* Gcore CDN → Viewers */}
        <path id="cutetube-p5" className="alg-mini-edge" d="M465 102 V140" />
        {/* Django → Postgres */}
        <path className="alg-mini-edge" d="M152 102 V140" />
        {/* Celery → Worker pool */}
        <path className="alg-mini-edge" d="M257 102 V140" />
      </g>

      {/* Animated packets — Phase 10 T10.5 */}
      <AnimatedPackets
        groups={[
          /* Upload + transcode flow. Amber packets signal in-flight
             segments being transcoded to HLS/DASH and uploaded to S3. */
          {
            edges: ["cutetube-p1", "cutetube-p2", "cutetube-p3", "cutetube-p4"],
            color: "amber",
            count: 3,
          },
          /* Delivery flow. Accent packets signal the watched-video path
             through the CDN. */
          { edges: ["cutetube-p5"], color: "acc", count: 2 },
        ]}
      />
    </svg>
  );
}