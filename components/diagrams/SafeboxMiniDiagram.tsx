/**
 * components/diagrams/SafeboxMiniDiagram.tsx
 *
 * Dedicated high-visibility architecture diagram for Safebox in the
 * homepage's "Everything I've built end-to-end" featured project card.
 *
 * Uses viewBox="0 0 480 320" (1.5:1 aspect ratio) matching MovioDiagram
 * and DrishtiAIDiagram, providing large, bold, and readable nodes within
 * the 420px card column.
 *
 * Architecture layout:
 *   Left (Col 1): Untrusted Workload (Agent CLI, Host Workspace, Egress Network, UID 1000)
 *   Center (Col 2): 5 Safebox Kernel Layers (Namespaces, OverlayFS, Landlock, NAT, PID 1)
 *   Right (Col 3): Security Guarantees (0 Escapes, Read-Only Host, Microsecond Revert, Zero Zombies)
 *
 * Animated packet flow via AnimatedPackets (accent for sandboxed execution, amber for boundary control).
 */

import { AnimatedPackets } from "./DiagramPackets";

export function SafeboxMiniDiagram() {
  return (
    <svg
      viewBox="0 0 480 320"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 480, height: "auto", display: "block" }}
      role="img"
      aria-label="Safebox: 5-layer unprivileged Linux kernel sandbox for autonomous AI coding agents."
    >
      <g aria-hidden>
        {/* ───── Column 1: Untrusted Workload (Left) ───── */}
        <rect className="alg-mini-node alg-mini-base" x={12} y={24} width={124} height={38} rx={6} />
        <text className="alg-mini-label" x={74} y={44} textAnchor="middle" fontSize={11}>
          Agent CLI (agy)
        </text>
        <text className="alg-sub" x={74} y={56} textAnchor="middle" fontSize={9} fill="var(--t3)">
          untrusted runner
        </text>

        <rect className="alg-mini-node alg-mini-base" x={12} y={92} width={124} height={38} rx={6} />
        <text className="alg-mini-label" x={74} y={112} textAnchor="middle" fontSize={11}>
          Host Workspace
        </text>
        <text className="alg-sub" x={74} y={124} textAnchor="middle" fontSize={9} fill="var(--t3)">
          unmodified repo
        </text>

        <rect className="alg-mini-node alg-mini-base" x={12} y={160} width={124} height={38} rx={6} />
        <text className="alg-mini-label" x={74} y={180} textAnchor="middle" fontSize={11}>
          Network Egress
        </text>
        <text className="alg-sub" x={74} y={192} textAnchor="middle" fontSize={9} fill="var(--t3)">
          isolated netns
        </text>

        <rect className="alg-mini-node alg-mini-base" x={12} y={228} width={124} height={38} rx={6} />
        <text className="alg-mini-label" x={74} y={248} textAnchor="middle" fontSize={11}>
          Unprivileged UID
        </text>
        <text className="alg-sub" x={74} y={260} textAnchor="middle" fontSize={9} fill="var(--t3)">
          zero host caps
        </text>

        {/* ───── Column 2: Safebox 5 Kernel Layers (Center) ───── */}
        <rect className="alg-mini-node alg-mini-judge" x={166} y={16} width={148} height={34} rx={5} />
        <text className="alg-mini-label" x={240} y={33} textAnchor="middle" fontSize={11}>
          User Namespaces
        </text>
        <text className="alg-sub" x={240} y={45} textAnchor="middle" fontSize={9} fill="var(--acc)">
          CLONE_NEWUSER (rootless)
        </text>

        <rect className="alg-mini-node alg-mini-judge" x={166} y={64} width={148} height={34} rx={5} />
        <text className="alg-mini-label" x={240} y={81} textAnchor="middle" fontSize={11}>
          Ephemeral OverlayFS
        </text>
        <text className="alg-sub" x={240} y={93} textAnchor="middle" fontSize={9} fill="var(--acc)">
          userxattr / tmpfs upper
        </text>

        <rect className="alg-mini-node alg-mini-judge" x={166} y={112} width={148} height={34} rx={5} />
        <text className="alg-mini-label" x={240} y={129} textAnchor="middle" fontSize={11}>
          Landlock LSM
        </text>
        <text className="alg-sub" x={240} y={141} textAnchor="middle" fontSize={9} fill="var(--acc)">
          ABI v3 default-deny
        </text>

        <rect className="alg-mini-node alg-mini-queue" x={166} y={160} width={148} height={34} rx={5} />
        <text className="alg-mini-label" x={240} y={177} textAnchor="middle" fontSize={11}>
          Userspace NAT
        </text>
        <text className="alg-sub" x={240} y={189} textAnchor="middle" fontSize={9} fill="var(--amber)">
          slirp4netns / tap0
        </text>

        <rect className="alg-mini-node alg-mini-judge" x={166} y={208} width={148} height={34} rx={5} />
        <text className="alg-mini-label" x={240} y={225} textAnchor="middle" fontSize={11}>
          PID 1 Subreaper Shim
        </text>
        <text className="alg-sub" x={240} y={237} textAnchor="middle" fontSize={9} fill="var(--acc)">
          signal mux + wait4 reap
        </text>

        <rect className="alg-mini-node alg-mini-base" x={166} y={256} width={148} height={34} rx={5} />
        <text className="alg-mini-label" x={240} y={273} textAnchor="middle" fontSize={11}>
          Rootless Container UID 0
        </text>
        <text className="alg-sub" x={240} y={285} textAnchor="middle" fontSize={9} fill="var(--t2)">
          uid 1000 on host
        </text>

        {/* ───── Column 3: Security Guarantees (Right) ───── */}
        <rect className="alg-mini-node alg-mini-judge" x={344} y={24} width={124} height={38} rx={6} />
        <text className="alg-mini-label" x={406} y={44} textAnchor="middle" fontSize={11}>
          0 Host Escapes
        </text>
        <text className="alg-sub" x={406} y={56} textAnchor="middle" fontSize={9} fill="var(--acc)">
          kernel enforced
        </text>

        <rect className="alg-mini-node alg-mini-judge" x={344} y={92} width={124} height={38} rx={6} />
        <text className="alg-mini-label" x={406} y={112} textAnchor="middle" fontSize={11}>
          Read-Only Host
        </text>
        <text className="alg-sub" x={406} y={124} textAnchor="middle" fontSize={9} fill="var(--acc)">
          lowerdir preserved
        </text>

        <rect className="alg-mini-node alg-mini-judge" x={344} y={160} width={124} height={38} rx={6} />
        <text className="alg-mini-label" x={406} y={180} textAnchor="middle" fontSize={11}>
          Instant Rollback
        </text>
        <text className="alg-sub" x={406} y={192} textAnchor="middle" fontSize={9} fill="var(--acc)">
          &lt;1ms safebox revert
        </text>

        <rect className="alg-mini-node alg-mini-base" x={344} y={228} width={124} height={38} rx={6} />
        <text className="alg-mini-label" x={406} y={248} textAnchor="middle" fontSize={11}>
          Zero Zombies
        </text>
        <text className="alg-sub" x={406} y={260} textAnchor="middle" fontSize={9} fill="var(--t3)">
          supervised cleanup
        </text>

        {/* ───── Flow Edges ───── */}
        {/* Left -> Center */}
        <path id="sbox-p1" className="alg-mini-edge" d="M136 43 H166" />
        <path id="sbox-p2" className="alg-mini-edge" d="M136 111 H166" />
        <path id="sbox-p3" className="alg-mini-edge" d="M136 179 H166" />
        <path id="sbox-p4" className="alg-mini-edge" d="M136 247 Q150 247 166 225" />

        {/* Center -> Right */}
        <path id="sbox-p5" className="alg-mini-edge" d="M314 33 Q328 33 344 43" />
        <path id="sbox-p6" className="alg-mini-edge" d="M314 81 Q328 81 344 111" />
        <path id="sbox-p7" className="alg-mini-edge" d="M314 129 Q328 129 344 179" />
        <path id="sbox-p8" className="alg-mini-edge" d="M314 225 Q328 247 344 247" />
      </g>

      {/* ───── Animated Packets ───── */}
      <AnimatedPackets
        groups={[
          { edges: ["sbox-p1", "sbox-p2", "sbox-p6"], color: "acc", count: 3 },
          { edges: ["sbox-p3", "sbox-p5", "sbox-p7"], color: "amber", count: 3 },
        ]}
      />
    </svg>
  );
}
