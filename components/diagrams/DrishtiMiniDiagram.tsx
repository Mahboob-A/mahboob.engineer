/**
 * components/diagrams/DrishtiMiniDiagram.tsx
 *
 * Mini diagram for the DrishtiAI project card on the landing page.
 * 4-layer horizontal CV pipeline:
 *   Ingest → Preprocessing → Inference Pipeline → Event Stream
 */

export function DrishtiMiniDiagram() {
  return (
    <svg
      viewBox="0 0 280 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 280, height: "auto", display: "block" }}
      role="img"
      aria-label="DrishtiAI: 4-layer computer-vision pipeline."
    >
      <g aria-hidden>
        <rect
          className="alg-mini-node alg-mini-base"
          x={10}
          y={10}
          width={260}
          height={30}
          rx={5}
        />
        <text className="alg-mini-label" x={140} y={30} textAnchor="middle" fontSize={11}>
          Ingest Layer
        </text>

        <rect
          className="alg-mini-node alg-mini-judge"
          x={10}
          y={55}
          width={260}
          height={30}
          rx={5}
        />
        <text className="alg-mini-label" x={140} y={75} textAnchor="middle" fontSize={11}>
          Preprocessing
        </text>

        <rect
          className="alg-mini-node alg-mini-judge"
          x={10}
          y={100}
          width={260}
          height={30}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={140}
          y={120}
          textAnchor="middle"
          fontSize={11}
        >
          Inference Pipeline
        </text>

        <rect
          className="alg-mini-node alg-mini-queue"
          x={10}
          y={145}
          width={260}
          height={30}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={140}
          y={165}
          textAnchor="middle"
          fontSize={11}
        >
          Event Stream
        </text>

        <path className="alg-mini-edge" d="M140 40 V55" />
        <path className="alg-mini-edge" d="M140 85 V100" />
        <path className="alg-mini-edge" d="M140 130 V145" />
      </g>
    </svg>
  );
}
