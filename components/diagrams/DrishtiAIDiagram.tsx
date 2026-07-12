/**
 * components/diagrams/DrishtiAIDiagram.tsx
 *
 * Full architecture diagram for the DrishtiAI case study. Shows the
 * 4-service monorepo + the 5-layer AI pipeline streaming in real time.
 *
 * Layout: Android/Web client (left) connects via WebRTC to FastAPI's
 * Vision Agent, which runs MediaPipe Face Mesh → OpenCV color → Roboflow
 * classification → Moondream VQA → Gemini synthesis → voice feedback
 * to the client. Django + Postgres sits below as the relational side.
 * PHC dashboard reads aggregated results via Django admin API.
 */

export function DrishtiAIDiagram() {
  return (
    <svg
      viewBox="0 0 520 360"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 520, height: "auto", display: "block" }}
      role="img"
      aria-label="DrishtiAI: Android client via WebRTC to 5-layer AI pipeline, Django backend for relational data."
    >
      <g aria-hidden>
        {/* ───── LEFT: Clients ───── */}
        <rect className="alg-mini-node alg-mini-base" x={12} y={20} width={110} height={34} rx={5} />
        <text className="alg-mini-label" x={67} y={42} textAnchor="middle" fontSize={11}>ASHA App (Android)</text>

        <rect className="alg-mini-node alg-mini-base" x={12} y={68} width={110} height={34} rx={5} />
        <text className="alg-mini-label" x={67} y={90} textAnchor="middle" fontSize={11}>PHC Admin (Web)</text>

        {/* ───── MIDDLE-LEFT: Nginx ───── */}
        <rect className="alg-mini-node alg-mini-base" x={144} y={44} width={88} height={34} rx={5} />
        <text className="alg-mini-label" x={188} y={66} textAnchor="middle" fontSize={11}>Nginx + SSL</text>

        {/* ───── MIDDLE: FastAPI + 5-layer AI pipeline ───── */}
        <rect className="alg-mini-node alg-mini-judge" x={248} y={20} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={313} y={42} textAnchor="middle" fontSize={11}>FastAPI :8001</text>

        <text className="alg-sub" x={313} y={70} textAnchor="middle" fontSize={9}>5-layer pipeline ↓</text>

        {/* 5 layers stacked */}
        <rect className="alg-mini-node alg-mini-base" x={248} y={78} width={130} height={26} rx={4} />
        <text className="alg-mini-label" x={313} y={95} textAnchor="middle" fontSize={10}>1. MediaPipe Face Mesh</text>

        <rect className="alg-mini-node alg-mini-base" x={248} y={108} width={130} height={26} rx={4} />
        <text className="alg-mini-label" x={313} y={125} textAnchor="middle" fontSize={10}>2. OpenCV color analysis</text>

        <rect className="alg-mini-node alg-mini-mauve" x={248} y={138} width={130} height={26} rx={4} />
        <text className="alg-mini-label" x={313} y={155} textAnchor="middle" fontSize={10}>3. Roboflow (cataract etc.)</text>

        <rect className="alg-mini-node alg-mini-mauve" x={248} y={168} width={130} height={26} rx={4} />
        <text className="alg-mini-label" x={313} y={185} textAnchor="middle" fontSize={10}>4. Moondream VQA</text>

        <rect className="alg-mini-node alg-mini-judge" x={248} y={198} width={130} height={26} rx={4} />
        <text className="alg-mini-label" x={313} y={215} textAnchor="middle" fontSize={10}>5. Gemini 2.5 Flash</text>

        <text className="alg-sub" x={313} y={244} textAnchor="middle" fontSize={9}>↑ @ 3 FPS · 7-step protocol</text>

        {/* Hindi/Bengali output */}
        <rect className="alg-mini-node alg-mini-queue" x={248} y={252} width={130} height={26} rx={4} />
        <text className="alg-mini-label" x={313} y={270} textAnchor="middle" fontSize={10}>Voice feedback (Hindi/Bengali)</text>

        {/* ───── RIGHT: Django + DBs ───── */}
        <rect className="alg-mini-node alg-mini-judge" x={400} y={20} width={108} height={34} rx={5} />
        <text className="alg-mini-label" x={454} y={42} textAnchor="middle" fontSize={11}>Django :8000</text>

        <rect className="alg-mini-node alg-mini-data" x={400} y={68} width={108} height={26} rx={4} />
        <text className="alg-mini-label" x={454} y={85} textAnchor="middle" fontSize={10}>Postgres 16</text>

        <rect className="alg-mini-node alg-mini-data" x={400} y={100} width={108} height={26} rx={4} />
        <text className="alg-mini-label" x={454} y={117} textAnchor="middle" fontSize={10}>Redis 7</text>

        <rect className="alg-mini-node alg-mini-queue" x={400} y={132} width={108} height={26} rx={4} />
        <text className="alg-mini-label" x={454} y={149} textAnchor="middle" fontSize={10}>Celery worker</text>

        <rect className="alg-mini-node alg-mini-base" x={400} y={164} width={108} height={26} rx={4} />
        <text className="alg-mini-label" x={454} y={181} textAnchor="middle" fontSize={10}>Prometheus metrics</text>

        <rect className="alg-mini-node alg-mini-base" x={400} y={196} width={108} height={26} rx={4} />
        <text className="alg-mini-label" x={454} y={213} textAnchor="middle" fontSize={10}>Grafana dashboards</text>

        {/* ───── Edges ───── */}
        {/* Android -> Nginx */}
        <path className="alg-mini-edge" d="M122 37 H144" />
        {/* Web -> Nginx */}
        <path className="alg-mini-edge" d="M122 85 H144" />
        {/* Nginx -> FastAPI (WebRTC) */}
        <path className="alg-mini-edge" d="M232 56 Q240 50 248 32" />
        {/* Nginx -> Django */}
        <path className="alg-mini-edge" d="M232 70 Q280 60 400 32" />
        {/* Voice feedback -> Android */}
        <path className="alg-mini-edge" d="M248 264 Q170 280 122 37" />
        {/* FastAPI -> Django (write results) */}
        <path className="alg-mini-edge" d="M378 32 H400" />
        {/* Django -> Postgres */}
        <path className="alg-mini-edge" d="M454 54 V68" />
        {/* Django -> Redis */}
        <path className="alg-mini-edge" d="M454 86 V100" />
        {/* Django -> Celery */}
        <path className="alg-mini-edge" d="M454 118 V132" />
        {/* Prometheus -> Django / FastAPI */}
        <path className="alg-mini-edge" d="M400 178 Q340 100 270 50" />
      </g>
    </svg>
  );
}