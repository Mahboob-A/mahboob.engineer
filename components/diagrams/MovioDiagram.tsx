/**
 * components/diagrams/MovioDiagram.tsx
 *
 * Full architecture diagram for Movio (3-service VoD platform).
 * Used in /work/movio case study. 12 nodes laid out across 3 columns:
 *
 *   COL 1 (Public)  COL 2 (Processing)          COL 3 (Delivery)
 *   ──────────     ───────────────               ─────────────
 *   Browser        RabbitMQ ──> Auth Service    CDN Edge (Gcore)
 *                  RabbitMQ ──> API Service     AWS S3 (segments)
 *                  RabbitMQ ──> Worker          Elasticsearch
 *                  FFmpeg ──> Transcoder        PostgreSQL
 *                  Lambda ──> Subtitle trigger
 *
 * The arrows show: API <-> Worker via RabbitMQ events, Worker writes
 * to S3, Lambda picks up subtitle uploads, CDN fronts S3, Postgres
 * holds metadata, Elasticsearch powers search.
 *
 * Static SVG, no JS. Color-codes per diagrams.css .alg-mini-* classes.
 */

export function MovioDiagram() {
  return (
    <svg
      viewBox="0 0 480 320"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 480, height: "auto", display: "block" }}
      role="img"
      aria-label="Movio: 3-service VOD platform with Celery pipeline and CDN delivery."
    >
      <g aria-hidden>
        {/* ───── Column 1: Public ───── */}
        <rect className="alg-mini-node alg-mini-base" x={10} y={20} width={120} height={34} rx={5} />
        <text className="alg-mini-label" x={70} y={42} textAnchor="middle" fontSize={11}>Browser / Player</text>

        <rect className="alg-mini-node alg-mini-base" x={10} y={80} width={120} height={34} rx={5} />
        <text className="alg-mini-label" x={70} y={102} textAnchor="middle" fontSize={11}>Nginx + CDN</text>

        <rect className="alg-mini-node alg-mini-base" x={10} y={140} width={120} height={34} rx={5} />
        <text className="alg-mini-label" x={70} y={162} textAnchor="middle" fontSize={11}>API Service (Django)</text>

        <rect className="alg-mini-node alg-mini-base" x={10} y={200} width={120} height={34} rx={5} />
        <text className="alg-mini-label" x={70} y={222} textAnchor="middle" fontSize={11}>Auth Service</text>

        {/* ───── Column 2: Processing ───── */}
        <rect className="alg-mini-node alg-mini-queue" x={170} y={20} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={235} y={42} textAnchor="middle" fontSize={11}>RabbitMQ</text>

        <rect className="alg-mini-node alg-mini-judge" x={170} y={80} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={235} y={102} textAnchor="middle" fontSize={11}>Worker (Celery)</text>

        <rect className="alg-mini-node alg-mini-judge" x={170} y={140} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={235} y={162} textAnchor="middle" fontSize={11}>FFmpeg Transcoder</text>

        <rect className="alg-mini-node alg-mini-mauve" x={170} y={200} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={235} y={222} textAnchor="middle" fontSize={11}>AWS Lambda (subtitle)</text>

        <rect className="alg-mini-node alg-mini-queue" x={170} y={260} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={235} y={282} textAnchor="middle" fontSize={11}>Redis (Celery + cache)</text>

        {/* ───── Column 3: Delivery ───── */}
        <rect className="alg-mini-node alg-mini-base" x={340} y={20} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={405} y={42} textAnchor="middle" fontSize={11}>AWS S3 (segments)</text>

        <rect className="alg-mini-node alg-mini-base" x={340} y={80} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={405} y={102} textAnchor="middle" fontSize={11}>Gcore CDN</text>

        <rect className="alg-mini-node alg-mini-data" x={340} y={140} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={405} y={162} textAnchor="middle" fontSize={11}>PostgreSQL</text>

        <rect className="alg-mini-node alg-mini-data" x={340} y={200} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={405} y={222} textAnchor="middle" fontSize={11}>Elasticsearch</text>

        <rect className="alg-mini-node alg-mini-data" x={340} y={260} width={130} height={34} rx={5} />
        <text className="alg-mini-label" x={405} y={282} textAnchor="middle" fontSize={11}>DRM Packaging</text>

        {/* ───── Edges ───── */}
        {/* Public flow */}
        <path className="alg-mini-edge" d="M70 54 V80" />
        <path className="alg-mini-edge" d="M70 114 V140" />

        {/* API <-> RabbitMQ */}
        <path className="alg-mini-edge" d="M130 157 H170" />
        {/* Auth <-> RabbitMQ */}
        <path className="alg-mini-edge" d="M130 217 H170" />

        {/* RabbitMQ -> Worker */}
        <path className="alg-mini-edge" d="M235 54 V80" />

        {/* Worker -> FFmpeg */}
        <path className="alg-mini-edge" d="M235 114 V140" />

        {/* Worker -> Lambda (subtitle) */}
        <path className="alg-mini-edge" d="M235 114 Q210 160 235 200" />

        {/* Worker -> Redis */}
        <path className="alg-mini-edge" d="M235 114 V260" />

        {/* Worker -> S3 */}
        <path className="alg-mini-edge" d="M300 97 H340" />

        {/* Lambda -> S3 */}
        <path className="alg-mini-edge" d="M300 217 Q330 130 340 36" />

        {/* S3 -> CDN */}
        <path className="alg-mini-edge" d="M405 54 V80" />

        {/* Worker -> Postgres */}
        <path className="alg-mini-edge" d="M300 97 H340" />

        {/* API -> Postgres */}
        <path className="alg-mini-edge" d="M130 157 Q230 140 340 157" />

        {/* CDN -> Browser */}
        <path className="alg-mini-edge" d="M340 97 Q200 90 130 97" />

        {/* Search: API <-> Elasticsearch */}
        <path className="alg-mini-edge" d="M130 157 Q230 200 340 217" />

        {/* Worker -> DRM */}
        <path className="alg-mini-edge" d="M300 97 Q340 200 405 260" />

        {/* DRM -> S3 */}
        <path className="alg-mini-edge" d="M405 260 Q380 130 405 54" />
      </g>
    </svg>
  );
}