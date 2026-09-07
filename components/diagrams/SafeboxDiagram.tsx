/**
 * components/diagrams/SafeboxDiagram.tsx
 *
 * High-fidelity architecture diagram for Safebox on /work and /work/safebox.
 *
 * Architecture layout:
 *   Left: Untrusted Workload (Agent terminal, host workspace, unprivileged user)
 *   Center: Safebox Supervisor Core (5 kernel layers: Namespaces, OverlayFS, Landlock LSM, Userspace NAT, PID 1 Shim)
 *   Right: Secure Outcomes (Zero Host Mutation, Instant Rollback, Zero Exfiltration)
 *
 * Pure SVG with animated packet flow lines, zero emojis, zero em dashes.
 */

export function SafeboxDiagram() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 980 440"
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="Safebox architecture: Untrusted Workload to Safebox Supervisor 5-layer kernel isolation core to Secure Outcomes."
    >
      <defs>
        <style>{`
          .sbox-bg { fill: var(--bg, #172318); }
          .sbox-surface { fill: var(--surface, #1C2E1E); stroke: var(--border, #334E3C); stroke-width: 1.5; rx: 8px; }
          .sbox-elevated { fill: var(--card, #223626); stroke: var(--border-strong, #406050); stroke-width: 1.5; rx: 6px; }
          .sbox-terminal-card { fill: var(--code-bg, #0D1511); stroke: var(--border, #334E3C); stroke-width: 1.5; rx: 6px; }
          
          .sbox-text-title { font-family: 'Space Grotesk', system-ui, sans-serif; font-size: 14px; font-weight: 700; fill: var(--t1, #D8EEE2); letter-spacing: 0.5px; }
          .sbox-text-sub { font-family: 'Inter', system-ui, sans-serif; font-size: 12px; fill: var(--t2, #9AC0A0); }
          .sbox-text-muted { font-family: 'Inter', system-ui, sans-serif; font-size: 11px; fill: var(--t3, #60908F); }
          .sbox-text-mono { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: var(--acc, #5CC9A0); }
          .sbox-text-amber { font-family: 'JetBrains Mono', monospace; font-size: 11px; fill: var(--amber, #F59E0B); }
          
          .sbox-badge-mint { fill: var(--acc-dim, #1E3828); stroke: var(--acc, #5CC9A0); stroke-width: 1; rx: 4px; }
          .sbox-badge-amber { fill: var(--amber-dim, #2A1F06); stroke: var(--amber, #F59E0B); stroke-width: 1; rx: 4px; }
          
          .sbox-packet-line { stroke: var(--acc, #5CC9A0); stroke-width: 1.5; stroke-dasharray: 6 4; fill: none; animation: sboxPacketFlow 1.5s linear infinite; }
          .sbox-blocked-line { stroke: var(--amber, #F59E0B); stroke-width: 1.5; stroke-dasharray: 4 4; fill: none; }
          .sbox-static-line { stroke: var(--border-strong, #406050); stroke-width: 1.5; fill: none; }

          @keyframes sboxPacketFlow {
            from { stroke-dashoffset: 20; }
            to { stroke-dashoffset: 0; }
          }
        `}</style>

        <marker
          id="sbox-arrow"
          viewBox="0 0 10 10"
          refX={6}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#5CC9A0" />
        </marker>
        <marker
          id="sbox-arrow-amber"
          viewBox="0 0 10 10"
          refX={6}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#F59E0B" />
        </marker>
      </defs>

      {/* Global Canvas Background */}
      <rect width={980} height={440} className="sbox-bg" rx={10} />

      {/* Section 1: Ingestion & Untrusted Workload (Left) */}
      <g transform="translate(24, 20)">
        <rect width={260} height={400} className="sbox-surface" />
        <text x={18} y={32} className="sbox-text-title">UNTRUSTED WORKLOAD</text>
        <text x={18} y={50} className="sbox-text-muted">Autonomous Agent Execution</text>

        {/* Agent Terminal */}
        <g transform="translate(16, 70)">
          <rect width={228} height={96} className="sbox-terminal-card" />
          <circle cx={14} cy={14} r={3.5} fill="#EF4444" />
          <circle cx={26} cy={14} r={3.5} fill="#F59E0B" />
          <circle cx={38} cy={14} r={3.5} fill="#10B981" />
          <text x={12} y={38} className="sbox-text-mono">$ agy -p &quot;task&quot;</text>
          <text x={12} y={56} className="sbox-text-muted">Attempts: edit, compile, shell</text>
          <text x={12} y={74} className="sbox-text-amber">Risks: rm -rf, token theft</text>
        </g>

        {/* Host Working Directory */}
        <g transform="translate(16, 186)">
          <rect width={228} height={96} className="sbox-elevated" />
          <text x={14} y={26} className="sbox-text-title">Host Workspace</text>
          <text x={14} y={46} className="sbox-text-mono">$PWD (Physical Disk)</text>
          <text x={14} y={66} className="sbox-text-sub">Git repos, configs, secrets</text>
          <rect x={14} y={74} width={94} height={16} className="sbox-badge-mint" />
          <text x={18} y={86} className="sbox-text-mono">READ-ONLY BASE</text>
        </g>

        {/* Caller Identity */}
        <g transform="translate(16, 302)">
          <rect width={228} height={80} className="sbox-elevated" />
          <text x={14} y={24} className="sbox-text-title">Unprivileged Host User</text>
          <text x={14} y={44} className="sbox-text-mono">Host UID: 1000, GID: 1000</text>
          <text x={14} y={64} className="sbox-text-muted">Zero host root privileges</text>
        </g>
      </g>

      {/* Section 2: Safebox Multi-Layer Kernel Core (Center) */}
      <g transform="translate(308, 20)">
        <rect width={364} height={400} className="sbox-surface" />
        <text x={20} y={32} className="sbox-text-title">SAFEBOX SUPERVISOR</text>
        <text x={20} y={50} className="sbox-text-muted">In-Process Syscall Orchestration (&lt;30ms)</text>

        {/* Layer 1: Namespaces */}
        <g transform="translate(18, 68)">
          <rect width={328} height={56} className="sbox-elevated" />
          <text x={14} y={22} className="sbox-text-title">1. Rootless User &amp; Mount Namespaces</text>
          <text x={14} y={42} className="sbox-text-mono">CLONE_NEWUSER | CLONE_NEWNS | MS_REC|MS_PRIVATE</text>
        </g>

        {/* Layer 2: OverlayFS */}
        <g transform="translate(18, 132)">
          <rect width={328} height={56} className="sbox-elevated" />
          <text x={14} y={22} className="sbox-text-title">2. Ephemeral OverlayFS Scratchpad</text>
          <text x={14} y={42} className="sbox-text-mono">lowerdir=$PWD, upperdir=/tmpfs (userxattr)</text>
        </g>

        {/* Layer 3: Landlock LSM */}
        <g transform="translate(18, 196)">
          <rect width={328} height={56} className="sbox-elevated" />
          <text x={14} y={22} className="sbox-text-title">3. Landlock LSM Mandatory Access Control</text>
          <text x={14} y={42} className="sbox-text-mono">PR_SET_NO_NEW_PRIVS | VFS Default-Deny</text>
        </g>

        {/* Layer 4: Userspace NAT */}
        <g transform="translate(18, 260)">
          <rect width={328} height={56} className="sbox-elevated" />
          <text x={14} y={22} className="sbox-text-title">4. Userspace NAT &amp; Domain Pinning</text>
          <text x={14} y={42} className="sbox-text-mono">CLONE_NEWNET | slirp4netns | PinnedIPSet</text>
        </g>

        {/* Layer 5: PID 1 Shim */}
        <g transform="translate(18, 324)">
          <rect width={328} height={56} className="sbox-elevated" />
          <text x={14} y={22} className="sbox-text-title">5. In-Process PID 1 Init Supervisor</text>
          <text x={14} y={42} className="sbox-text-mono">RunShim | Signal Forwarding | Zombie Reaping</text>
        </g>
      </g>

      {/* Section 3: Guaranteed Outcomes (Right) */}
      <g transform="translate(696, 20)">
        <rect width={260} height={400} className="sbox-surface" />
        <text x={18} y={32} className="sbox-text-title">SECURE OUTCOMES</text>
        <text x={18} y={50} className="sbox-text-muted">Deterministic Boundary Guarantees</text>

        {/* Zero Host Mutation */}
        <g transform="translate(16, 70)">
          <rect width={228} height={96} className="sbox-elevated" />
          <rect x={14} y={14} width={70} height={16} className="sbox-badge-mint" />
          <text x={18} y={26} className="sbox-text-mono">VERIFIED</text>
          <text x={14} y={48} className="sbox-text-title">Zero Host Mutation</text>
          <text x={14} y={66} className="sbox-text-sub">Writes isolated in memory.</text>
          <text x={14} y={82} className="sbox-text-muted">Host disk remains 100% clean.</text>
        </g>

        {/* Single-Command Revert */}
        <g transform="translate(16, 186)">
          <rect width={228} height={96} className="sbox-elevated" />
          <rect x={14} y={14} width={76} height={16} className="sbox-badge-mint" />
          <text x={18} y={26} className="sbox-text-mono">&lt; 1ms ROLL</text>
          <text x={14} y={48} className="sbox-text-title">Instant Rollback</text>
          <text x={14} y={66} className="sbox-text-mono">safebox revert --yes</text>
          <text x={14} y={82} className="sbox-text-muted">Wipes upperdir without git loss.</text>
        </g>

        {/* Exfiltration Blocked */}
        <g transform="translate(16, 302)">
          <rect width={228} height={80} className="sbox-elevated" />
          <rect x={14} y={14} width={74} height={16} className="sbox-badge-amber" />
          <text x={18} y={26} className="sbox-text-amber">BLOCKED</text>
          <text x={14} y={48} className="sbox-text-title">Zero Exfiltration</text>
          <text x={14} y={66} className="sbox-text-muted">~/.ssh denied; rogue IPs dropped.</text>
        </g>
      </g>

      {/* Connecting Visual Vectors */}
      <path d="M 284 118 L 308 96" className="sbox-packet-line" markerEnd="url(#sbox-arrow)" />
      <path d="M 284 234 L 308 160" className="sbox-packet-line" markerEnd="url(#sbox-arrow)" />
      <path d="M 672 160 L 696 118" className="sbox-packet-line" markerEnd="url(#sbox-arrow)" />
      <path d="M 672 224 L 696 234" className="sbox-packet-line" markerEnd="url(#sbox-arrow)" />
      <path d="M 672 288 L 696 342" className="sbox-packet-line" markerEnd="url(#sbox-arrow)" />
    </svg>
  );
}
