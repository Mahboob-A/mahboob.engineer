/**
 * components/diagrams/AlgocodeDiagram.tsx
 *
 * The animated Algocode request-trace SVG that lives in the Hero
 * (right column) and is reused inside /work/algocode as the project
 * architecture diagram.
 *
 * Visual reference: portfolio-flat-mockup.html lines 506–619 (the
 * hero diagram inside .diagram-panel).
 *
 * 7 nodes:
 *   Client → Code Manager → RabbitMQ (cpp_submit_queue) →
 *   RCE Engine → Docker Judge → RabbitMQ (result_queue) →
 *   Code Manager → MongoDB / Redis (result store)
 *   Auth Service → Code Manager (auth check)
 *
 * 7 animated packets travel along the edges in a 3.2s loop.
 * This is **pure SVG + SMIL** — no JavaScript, no React state. The
 * browser handles the animation natively.
 *
 * All colors come from data/tokens.ts via the CSS variables in
 * globals.css (`--bg`, `--border`, `--text-t1`, etc.).
 */

export function AlgocodeDiagram() {
  return (
    <svg
      viewBox="0 0 980 320"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="Algocode — distributed online judge, live request trace through 3 services and a sandboxed C++ judge."
    >
      {/* ─── Edges (rendered first so nodes sit on top) ────────────── */}
      <g aria-hidden>
        {/* client → code manager */}
        <path id="alg-p1" className="alg-edge" d="M 90 150 H 220" />
        {/* code manager → submit queue */}
        <path id="alg-p2" className="alg-edge" d="M 380 130 H 470" />
        {/* submit queue → rce engine */}
        <path id="alg-p3" className="alg-edge" d="M 630 130 H 760" />
        {/* rce engine → docker judge */}
        <path id="alg-p4" className="alg-edge" d="M 820 165 V 215" />
        {/* docker judge → result queue */}
        <path id="alg-p5" className="alg-edge" d="M 760 250 H 630" />
        {/* result queue → code manager */}
        <path id="alg-p6" className="alg-edge" d="M 470 250 H 380 V 170" />
        {/* code manager → mongo/redis */}
        <path id="alg-p7" className="alg-edge" d="M 300 170 V 250" />
        {/* auth service → code manager */}
        <path id="alg-p8" className="alg-edge" d="M 300 90 V 110" />
      </g>

      {/* ─── Nodes ───────────────────────────────────────────────── */}
      {/* Client */}
      <g>
        <rect
          className="alg-node alg-node-data"
          x={20}
          y={125}
          width={70}
          height={50}
          rx={6}
        />
        <text className="alg-label" x={55} y={148} textAnchor="middle">
          Client
        </text>
        <text className="alg-sub" x={55} y={163} textAnchor="middle">
          postman / api
        </text>
      </g>

      {/* Auth Service (data-style: blue/teal stroke) */}
      <g>
        <rect
          className="alg-node alg-node-data"
          x={220}
          y={40}
          width={160}
          height={50}
          rx={6}
        />
        <text className="alg-label" x={300} y={63} textAnchor="middle">
          Auth Service
        </text>
        <text className="alg-sub" x={300} y={78} textAnchor="middle">
          django · postgresql
        </text>
      </g>

      {/* Code Manager */}
      <g>
        <rect
          className="alg-node alg-node-base"
          x={220}
          y={105}
          width={160}
          height={65}
          rx={6}
        />
        <text className="alg-label" x={300} y={130} textAnchor="middle">
          Code Manager
        </text>
        <text className="alg-sub" x={300} y={145} textAnchor="middle">
          django rest framework
        </text>
        <text className="alg-sub" x={300} y={158} textAnchor="middle">
          submit · poll result
        </text>
      </g>

      {/* Submit Queue (queue-style: amber stroke) */}
      <g>
        <rect
          className="alg-node alg-node-queue"
          x={470}
          y={105}
          width={160}
          height={50}
          rx={6}
        />
        <text className="alg-label" x={550} y={128} textAnchor="middle">
          RabbitMQ
        </text>
        <text className="alg-sub" x={550} y={143} textAnchor="middle">
          cpp_submit_queue
        </text>
      </g>

      {/* RCE Engine (judge-style: accent stroke) */}
      <g>
        <rect
          className="alg-node alg-node-judge"
          x={760}
          y={105}
          width={160}
          height={50}
          rx={6}
        />
        <text className="alg-label" x={840} y={128} textAnchor="middle">
          RCE Engine
        </text>
        <text className="alg-sub" x={840} y={143} textAnchor="middle">
          consumer · scheduler
        </text>
      </g>

      {/* Docker Judge */}
      <g>
        <rect
          className="alg-node alg-node-judge"
          x={760}
          y={215}
          width={160}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={840} y={238} textAnchor="middle">
          C++ Judge
        </text>
        <text className="alg-sub" x={840} y={253} textAnchor="middle">
          sibling docker · sandboxed
        </text>
        <text className="alg-sub" x={840} y={266} textAnchor="middle">
          AC · WA · TLE · MLE
        </text>
      </g>

      {/* Result Queue */}
      <g>
        <rect
          className="alg-node alg-node-queue"
          x={470}
          y={225}
          width={160}
          height={50}
          rx={6}
        />
        <text className="alg-label" x={550} y={248} textAnchor="middle">
          RabbitMQ
        </text>
        <text className="alg-sub" x={550} y={263} textAnchor="middle">
          result_queue
        </text>
      </g>

      {/* MongoDB / Redis */}
      <g>
        <rect
          className="alg-node alg-node-data"
          x={220}
          y={225}
          width={160}
          height={60}
          rx={6}
        />
        <text className="alg-label" x={300} y={250} textAnchor="middle">
          MongoDB · Redis
        </text>
        <text className="alg-sub" x={300} y={265} textAnchor="middle">
          result store · cache
        </text>
      </g>

      {/* ─── Animated packets ────────────────────────────────────── */}
      <g aria-hidden>
        <circle className="alg-packet" r={4}>
          <animateMotion dur="3.2s" repeatCount="indefinite" begin="0s">
            <mpath href="#alg-p1" />
          </animateMotion>
        </circle>
        <circle className="alg-packet" r={4}>
          <animateMotion dur="3.2s" repeatCount="indefinite" begin="0.4s">
            <mpath href="#alg-p2" />
          </animateMotion>
        </circle>
        <circle className="alg-packet alg-packet-amber" r={4}>
          <animateMotion dur="3.2s" repeatCount="indefinite" begin="0.9s">
            <mpath href="#alg-p3" />
          </animateMotion>
        </circle>
        <circle className="alg-packet alg-packet-amber" r={4}>
          <animateMotion dur="3.2s" repeatCount="indefinite" begin="1.4s">
            <mpath href="#alg-p4" />
          </animateMotion>
        </circle>
        <circle className="alg-packet alg-packet-acc" r={4}>
          <animateMotion dur="3.2s" repeatCount="indefinite" begin="1.9s">
            <mpath href="#alg-p5" />
          </animateMotion>
        </circle>
        <circle className="alg-packet alg-packet-acc" r={4}>
          <animateMotion dur="3.2s" repeatCount="indefinite" begin="2.4s">
            <mpath href="#alg-p6" />
          </animateMotion>
        </circle>
        <circle className="alg-packet alg-packet-acc" r={4}>
          <animateMotion dur="3.2s" repeatCount="indefinite" begin="2.8s">
            <mpath href="#alg-p7" />
          </animateMotion>
        </circle>
      </g>
    </svg>
  );
}
