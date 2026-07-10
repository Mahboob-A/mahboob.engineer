/**
 * components/sections/Hero.tsx
 *
 * The top section of the landing page. Per master §2 + flat mockup
 * lines 482–621:
 *
 *   ┌───────────────────────────────────────────────────────────────┐
 *   │ BACKEND & PLATFORM ENGINEER — BANGALORE / CHENNAI   (eyebrow)│
 *   │                                                              │
 *   │ I build the infrastructure layer                            │
 *   │ nobody sees — and write about it.        (h1 + accent span) │
 *   │                                                              │
 *   │ 2.5+ years architecting distributed systems:                  │
 *   │ microservices, async pipelines, ...       (description)      │
 *   │                                                              │
 *   │ [View systems →]  [Read the writing]  [Open an issue]  (CTAs)│
 *   │                                                              │
 *   │ ┌── 3 ──┬── 6+ ──┬── 35% ──┬── 12+ ──┐         (StatRow)    │
 *   │ │  ...  │  ...   │   ...   │   ...   │                      │
 *   │ └───────┴────────┴─────────┴─────────┘                      │
 *   └───────────────────────────────────────────────────────────────┘
 *
 * Layout: 1-column on mobile (stack everything), 2-column on `lg+`
 * (text left, diagram right). The AlgocodeDiagram (T2.2) lives in the
 * right column.
 */

import Link from "next/link";
import { StatRow } from "@/components/ui/StatRow";
import { DiagramPanel } from "@/components/ui/DiagramPanel";
import { AlgocodeDiagram } from "@/components/diagrams/AlgocodeDiagram";

const STATS = [
  { num: "3", label: "production-grade systems shipped" },
  { num: "6+", label: "services in microservice architectures" },
  { num: "35%", label: "AWS cost reduction driven" },
  { num: "12+", label: "deep-dive engineering posts" },
] as const;

export function Hero() {
  return (
    <header id="top" className="border-border relative border-b pt-[100px] pb-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Eyebrow + headline + description + CTAs (left col on lg+) */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <p className="text-amber mb-[18px] flex items-center gap-[10px] font-mono text-[13px] tracking-[1px]">
              <span aria-hidden className="bg-amber inline-block h-px w-7" />
              BACKEND &amp; PLATFORM ENGINEER — BANGALORE / CHENNAI
            </p>

            <h1 className="font-display text-t1 text-[clamp(36px,5.5vw,64px)] leading-[1.08] font-bold tracking-[-1px]">
              I build the <span className="text-acc">infrastructure layer</span>
              <br />
              nobody sees — and write about it.
            </h1>

            <p className="text-t2 mt-5 max-w-[560px] text-[18px]">
              <strong className="text-t1 font-semibold">
                2.5+ years architecting distributed systems:
              </strong>{" "}
              microservices, async pipelines, container isolation, and video
              infrastructure. Currently leading backend architecture at NexBell, while
              writing{" "}
              <strong className="text-t1 font-semibold">The Backend Diaries</strong> —
              deep dives into the systems I build.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                href="#work"
                className="bg-acc text-bg hover:bg-acc/90 inline-flex items-center gap-2 rounded-md px-5 py-3 font-mono text-[13px] font-semibold transition-colors"
              >
                View systems →
              </Link>
              <Link
                href="#blog"
                className="border-border text-t1 hover:border-acc hover:text-acc inline-flex items-center gap-2 rounded-md border px-5 py-3 font-mono text-[13px] font-medium transition-colors"
              >
                Read the writing
              </Link>
              <Link
                href="#contact"
                className="border-border text-t1 hover:border-acc hover:text-acc inline-flex items-center gap-2 rounded-md border px-5 py-3 font-mono text-[13px] font-medium transition-colors"
              >
                Open an issue
              </Link>
            </div>

            <StatRow stats={[...STATS]} className="mt-12" />
          </div>

          {/* Right column: animated Algocode diagram inside a DiagramPanel */}
          <div className="self-start">
            <DiagramPanel
              title="algocode — distributed online judge"
              sub="live request trace · 3 services · rabbitmq · docker rce"
              liveLabel="request in flight"
            >
              <AlgocodeDiagram />
            </DiagramPanel>
          </div>
        </div>
      </div>
    </header>
  );
}
