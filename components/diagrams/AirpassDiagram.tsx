/**
 * components/diagrams/AirpassDiagram.tsx
 *
 * AirPass P2P-over-WebRTC architecture. The point of this diagram is
 * that the file never touches the server — only the signaling
 * handshake (SDP/ICE) does. Triangular layout: Browser A on the left,
 * FastAPI signaling server in the middle (small, "metadata only"),
 * Browser B on the right. A heavy direct arrow between the two
 * browsers shows the actual file path; a thin dotted arrow shows the
 * signaling path through the server.
 *
 * Static SVG, no JS.
 */

export function AirpassDiagram() {
  return (
    <svg
      viewBox="0 0 520 280"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 520, height: "auto", display: "block" }}
      role="img"
      aria-label="AirPass: peer-to-peer file transfer via WebRTC. Signaling only goes through the server; file data flows directly between browsers."
    >
      <defs>
        <marker
          id="arrow-data"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="var(--acc)" />
        </marker>
        <marker
          id="arrow-signal"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="var(--t3)" />
        </marker>
      </defs>

      <g aria-hidden>
        {/* Browser A (left) */}
        <rect className="alg-mini-node alg-mini-base" x={20} y={70} width={140} height={70} rx={8} />
        <text className="alg-mini-label" x={90} y={96} textAnchor="middle" fontSize={12}>Browser A</text>
        <text className="alg-sub" x={90} y={114} textAnchor="middle" fontSize={9}>sender · chunks 64KB</text>
        <text className="alg-sub" x={90} y={128} textAnchor="middle" fontSize={9}>optional AES-256-GCM</text>

        {/* FastAPI signaling (middle, smaller) */}
        <rect className="alg-mini-node alg-mini-base" x={210} y={110} width={100} height={48} rx={5} style={{ opacity: 0.6 }} />
        <text className="alg-mini-label" x={260} y={132} textAnchor="middle" fontSize={11}>FastAPI</text>
        <text className="alg-sub" x={260} y={146} textAnchor="middle" fontSize={8.5}>signaling only</text>
        <text className="alg-sub" x={260} y={157} textAnchor="middle" fontSize={8}>no file data</text>

        {/* Browser B (right) */}
        <rect className="alg-mini-node alg-mini-base" x={360} y={70} width={140} height={70} rx={8} />
        <text className="alg-mini-label" x={430} y={96} textAnchor="middle" fontSize={12}>Browser B</text>
        <text className="alg-sub" x={430} y={114} textAnchor="middle" fontSize={9}>receiver · reliable ordered</text>
        <text className="alg-sub" x={430} y={128} textAnchor="middle" fontSize={9}>backpressure throttled</text>

        {/* Direct file transfer (Browser A <-> Browser B) — heavy accent */}
        <path
          d="M160 95 Q260 30 360 95"
          className="alg-mini-edge"
          stroke="var(--acc)"
          strokeWidth={3}
          fill="none"
          markerEnd="url(#arrow-data)"
        />
        <text className="alg-sub" x={260} y={42} textAnchor="middle" fontSize={10} fill="var(--acc)" fontWeight={600}>
          file transfer (P2P · never touches server)
        </text>

        {/* Signaling (Browser A -> server -> Browser B) — thin dashed */}
        <path
          d="M160 115 H210"
          className="alg-mini-edge"
          stroke="var(--t3)"
          strokeWidth={1}
          strokeDasharray="4 3"
          fill="none"
          markerEnd="url(#arrow-signal)"
        />
        <path
          d="M310 134 H360"
          className="alg-mini-edge"
          stroke="var(--t3)"
          strokeWidth={1}
          strokeDasharray="4 3"
          fill="none"
          markerEnd="url(#arrow-signal)"
        />
        <text className="alg-sub" x={185} y={105} textAnchor="middle" fontSize={8} fill="var(--t3)">SDP/ICE</text>
        <text className="alg-sub" x={335} y={126} textAnchor="middle" fontSize={8} fill="var(--t3)">SDP/ICE</text>

        {/* Bottom annotation */}
        <rect className="alg-mini-node alg-mini-data" x={140} y={200} width={240} height={48} rx={5} />
        <text className="alg-mini-label" x={260} y={222} textAnchor="middle" fontSize={10.5}>
          In-memory rooms · auto-expire 30 min
        </text>
        <text className="alg-sub" x={260} y={237} textAnchor="middle" fontSize={9}>
          bcrypt password + optional AES-256-GCM E2E
        </text>
      </g>
    </svg>
  );
}