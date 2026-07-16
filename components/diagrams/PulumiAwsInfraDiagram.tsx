/**
 * components/diagrams/PulumiAwsInfraDiagram.tsx
 *
 * Mini architecture diagram for the Pulumi AWS Infra showcase-tier card.
 * Multi-AZ VPC topology: Internet → ALB (public subnet) → ASG with
 * Django app instances (private subnets across AZs) → RDS Postgres
 * (private subnet) + S3. Route53 in front, Bastion host for SSH.
 *
 * Pure SVG, viewBox 480x200. Phase 9 (T9.3).
 */

export function PulumiAwsInfraDiagram() {
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
      aria-label="Pulumi AWS Infra: multi-AZ VPC with ALB in public subnets, Auto Scaling Group of Django app instances in private subnets, RDS Postgres, S3, Route53, Bastion host."
    >
      <g aria-hidden>
        {/* Internet */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={10}
          y={70}
          width={62}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={41}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Internet
        </text>

        {/* Route53 */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={90}
          y={70}
          width={64}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={122}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          Route53
        </text>

        {/* ALB (public subnet) */}
        <rect
          className="alg-mini-node alg-mini-judge"
          x={174}
          y={70}
          width={62}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={205}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          ALB
        </text>

        {/* ASG (private subnet — top) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={258}
          y={20}
          width={88}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={302}
          y={39}
          textAnchor="middle"
          fontSize={10}
        >
          App AZ-a
        </text>

        {/* ASG (private subnet — bottom) */}
        <rect
          className="alg-mini-node alg-mini-base"
          x={258}
          y={120}
          width={88}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={302}
          y={139}
          textAnchor="middle"
          fontSize={10}
        >
          App AZ-b
        </text>

        {/* ASG group label (dashed border container would go here in a fuller diagram; skipped for compactness) */}

        {/* RDS Postgres (private subnet) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={366}
          y={20}
          width={68}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={400}
          y={39}
          textAnchor="middle"
          fontSize={10}
        >
          RDS
        </text>

        {/* S3 (private) */}
        <rect
          className="alg-mini-node alg-mini-data"
          x={366}
          y={70}
          width={68}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={400}
          y={89}
          textAnchor="middle"
          fontSize={10}
        >
          S3
        </text>

        {/* Bastion (public subnet, far right) */}
        <rect
          className="alg-mini-node alg-mini-queue"
          x={366}
          y={120}
          width={68}
          height={32}
          rx={5}
        />
        <text
          className="alg-mini-label"
          x={400}
          y={139}
          textAnchor="middle"
          fontSize={10}
        >
          Bastion
        </text>

        {/* Edges */}
        {/* Internet → Route53 */}
        <path className="alg-mini-edge" d="M72 86 H90" />
        {/* Route53 → ALB */}
        <path className="alg-mini-edge" d="M154 86 H174" />
        {/* ALB → App AZ-a */}
        <path className="alg-mini-edge" d="M236 78 Q247 50 258 36" />
        {/* ALB → App AZ-b */}
        <path className="alg-mini-edge" d="M236 94 Q247 110 258 136" />
        {/* App AZ-a → RDS */}
        <path className="alg-mini-edge" d="M346 36 H366" />
        {/* App AZ-b → S3 */}
        <path className="alg-mini-edge" d="M346 136 Q355 110 366 94" />
        {/* Bastion → App AZ-a (SSH tunnel) */}
        <path
          className="alg-mini-edge"
          d="M366 136 Q340 90 346 36"
          strokeDasharray="3 2"
        />
      </g>
    </svg>
  );
}