/**
 * components/diagrams/AlgocodeMiniDiagram.tsx
 *
 * Mini diagram used inside the Algocode project card on the landing
 * page. Simplified version of the full AlgocodeDiagram (T2.2) — just
 * 4 nodes (Auth Service, Code Manager, RCE Engine, RabbitMQ) with
 * crossing arrows, no animation.
 *
 * All colors via CSS variables from data/tokens.ts.
 */

export function AlgocodeMiniDiagram() {
  return (
    <svg
      viewBox="0 0 280 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 280, height: "auto", display: "block" }}
      role="img"
      aria-label="Algocode: 3 services coordinated through RabbitMQ."
    >
      <g aria-hidden>
        <rect
          className="alg-mini-node alg-mini-base"
          x={10}
          y={15}
          width={110}
          height={40}
          rx={5}
        />
        <text className="alg-mini-label" x={65} y={40} textAnchor="middle" fontSize={11}>
          Auth Service
        </text>

        <rect
          className="alg-mini-node alg-mini-base"
          x={10}
          y={75}
          width={110}
          height={40}
          rx={5}
        />
        <text className="alg-mini-label" x={65} y={100} textAnchor="middle" fontSize={11}>
          Code Manager
        </text>

        <rect
          className="alg-mini-node alg-mini-judge"
          x={160}
          y={75}
          width={110}
          height={40}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={215}
          y={100}
          textAnchor="middle"
          fontSize={11}
        >
          RCE Engine
        </text>

        <rect
          className="alg-mini-node alg-mini-queue"
          x={160}
          y={145}
          width={110}
          height={40}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={215}
          y={170}
          textAnchor="middle"
          fontSize={11}
        >
          RabbitMQ
        </text>

        <path className="alg-mini-edge" d="M65 55 V75" />
        <path className="alg-mini-edge" d="M120 95 H160" />
        <path className="alg-mini-edge" d="M215 115 V145" />
        <path className="alg-mini-edge" d="M160 165 H120 V115" />
      </g>
    </svg>
  );
}
