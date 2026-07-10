/**
 * components/diagrams/MovioMiniDiagram.tsx
 *
 * Mini diagram for the Movio project card on the landing page.
 * 5-node video transcoding pipeline:
 *   Upload & Transcode → FFmpeg Workers → HLS/DASH Store → CDN Edge → DRM
 */

export function MovioMiniDiagram() {
  return (
    <svg
      viewBox="0 0 280 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 280, height: "auto", display: "block" }}
      role="img"
      aria-label="Movio: HLS/DASH transcoding pipeline through CDN."
    >
      <g aria-hidden>
        <rect
          className="alg-mini-node alg-mini-base"
          x={10}
          y={15}
          width={120}
          height={40}
          rx={5}
        />
        <text className="alg-mini-label" x={70} y={40} textAnchor="middle" fontSize={11}>
          Upload &amp; Transcode
        </text>

        <rect
          className="alg-mini-node alg-mini-judge"
          x={150}
          y={15}
          width={120}
          height={40}
          rx={5}
        />
        <text className="alg-mini-label" x={210} y={40} textAnchor="middle" fontSize={11}>
          FFmpeg Workers
        </text>

        <rect
          className="alg-mini-node alg-mini-data"
          x={10}
          y={85}
          width={120}
          height={40}
          rx={5}
        />
        <text className="alg-mini-label" x={70} y={110} textAnchor="middle" fontSize={11}>
          HLS / DASH Store
        </text>

        <rect
          className="alg-mini-node alg-mini-queue"
          x={150}
          y={85}
          width={120}
          height={40}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={210}
          y={110}
          textAnchor="middle"
          fontSize={11}
        >
          CDN Edge
        </text>

        <rect
          className="alg-mini-node alg-mini-mauve"
          x={80}
          y={150}
          width={120}
          height={40}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={140}
          y={175}
          textAnchor="middle"
          fontSize={11}
        >
          DRM Layer
        </text>

        <path className="alg-mini-edge" d="M130 35 H150" />
        <path className="alg-mini-edge" d="M70 55 V85" />
        <path className="alg-mini-edge" d="M210 55 V85" />
        <path className="alg-mini-edge" d="M130 105 H150" />
        <path className="alg-mini-edge" d="M140 125 V150" />
      </g>
    </svg>
  );
}
