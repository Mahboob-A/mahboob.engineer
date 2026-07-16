/**
 * components/diagrams/ImgTwistDiagram.tsx
 *
 * Mini architecture diagram for the ImgTwist showcase-tier card.
 * Image hosting flow: browser upload → Django REST API → Celery
 * worker (Pillow resize) → S3 → CloudFront-style CDN → viewer.
 *
 * Animated packets (Phase 10 T10.5):
 *   - Amber for the upload + resize path (Browser → Nginx → Django
 *     → Redis → Celery → Pillow → S3). The async image pipeline.
 *   - Accent for the read path (S3 → Viewer).
 *
 * Pure SVG, viewBox 480x200. Phase 9 (T9.3) authored, Phase 10
 * (T10.5) animated.
 */

import { AnimatedPackets } from "./DiagramPackets";

export function ImgTwistDiagram() {
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
      aria-label="ImgTwist: browser upload to Django API, Celery + Pillow resize, S3 storage, viewer reads via CDN."
    >
      <g aria-hidden>
        {/* Browser (upload) */}
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

        {/* Nginx Proxy Manager */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={104}
          y={70}
          width={70}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={139}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Nginx
        </text>

        {/* Django REST API */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={198}
          y={70}
          width={84}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={240}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Django REST
        </text>

        {/* Redis broker */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={310}
          y={20}
          width={64}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={342}
          y={39}
          textAnchor="middle"
          fontSize={10}
        >
          Redis
        </text>

        {/* Celery + Pillow worker */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={310}
          y={70}
          width={64}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={342}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Celery
        </text>

        {/* Pillow (resize) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={310}
          y={120}
          width={64}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={342}
          y={139}
          textAnchor="middle"
          fontSize={10}
        >
          Pillow
        </text>

        {/* S3 */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={400}
          y={70}
          width={70}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={435}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          S3
        </text>

        {/* Viewer */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={400}
          y={140}
          width={70}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={435}
          y={159}
          textAnchor="middle"
          fontSize={10}
        >
          Viewer
        </text>

        {/* Edges (with IDs for AnimatedPackets) */}
        {/* Browser → Nginx */}
        <path id="imgtwist-p1" className="alg-mini-edge" d="M80 86 H104" />
        {/* Nginx → Django */}
        <path id="imgtwist-p2" className="alg-mini-edge" d="M174 86 H198" />
        {/* Django → Redis (queue) */}
        <path id="imgtwist-p3" className="alg-mini-edge" d="M282 78 Q295 50 310 36" />
        {/* Django → Celery (enqueue) */}
        <path id="imgtwist-p4" className="alg-mini-edge" d="M282 86 H310" />
        {/* Celery → Pillow (process) */}
        <path id="imgtwist-p5" className="alg-mini-edge" d="M342 102 V120" />
        {/* Pillow → S3 (upload) */}
        <path
          id="imgtwist-p6"
          className="alg-mini-edge"
          d="M374 136 Q387 110 400 90"
        />
        {/* S3 → Viewer (read) */}
        <path id="imgtwist-p7" className="alg-mini-edge" d="M435 102 V140" />
      </g>

      {/* Animated packets — Phase 10 T10.5 */}
      <AnimatedPackets
        groups={[
          /* Upload + resize pipeline. Amber packets signal in-flight
             images being resized by Pillow and uploaded to S3. */
          {
            edges: [
              "imgtwist-p1",
              "imgtwist-p2",
              "imgtwist-p3",
              "imgtwist-p4",
              "imgtwist-p5",
              "imgtwist-p6",
            ],
            color: "amber",
            count: 3,
          },
          /* Read path. Accent packets signal served images. */
          { edges: ["imgtwist-p7"], color: "acc", count: 2 },
        ]}
      />
    </svg>
  );
}