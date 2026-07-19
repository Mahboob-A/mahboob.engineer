/**
 * components/hero/HeroTerminal.tsx
 *
 * Interactive terminal under the Hero's Algocode diagram on the landing
 * page. Phase 7 (T7.6).
 *
 * The terminal ships in **static mode** (v1) — pre-canned payloads per
 * command chip. The chips make it *feel* interactive (clicking surfaces
 * a fresh result, typewriter animates the text) without freeform input.
 *
 * **RAG upgrade path (v2, documented in docs/RAG_TERMINAL.md):**
 * swap the chip → static-render pair for chip → `fetch('/api/rag',
 * { question: chipKey })` + streaming response. The visual shell
 * (TerminalBlock + chip row) stays identical. v2 is a future task.
 *
 * Design:
 * - `'use client'` to own the typewriter state.
 * - Wraps the existing `<TerminalBlock label="terminal — type a command">`
 *   (Server Component, T2.7) so the visual contract is shared with the
 *   Contact form.
 * - 6 chip buttons (whoami / projects / stack / latest / contact / help).
 * - Each chip click triggers a typewriter result (12ms/char).
 * - `useReducedMotion()` gates the typewriter; with reduced-motion,
 *   results snap in fully rendered.
 * - Esc listener within the component clears the result.
 * - "Clear" button + Esc both reset to the chip row.
 *
 * Files:
 *   - HeroTerminal.tsx (this file) — the component
 *   - HeroTerminal.css — cursor blink + result fade
 */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { PROJECTS } from "@/data/projects";
import { STACK } from "@/data/stack";
import { ACTIVE_EXPERIENCE, COMPLETED_EXPERIENCE } from "@/data/experience";
import { BLOG_POSTS } from "@/data/blog";
import "./HeroTerminal.css";

type ChipKey = "whoami" | "projects" | "stack" | "latest" | "contact" | "help";

const CHIP_ORDER: ChipKey[] = [
  "whoami",
  "projects",
  "stack",
  "latest",
  "contact",
  "help",
];

const CHIP_LABEL: Record<ChipKey, string> = {
  whoami: "whoami",
  projects: "projects",
  stack: "stack",
  latest: "latest",
  contact: "contact",
  help: "help",
};

/**
 * Build the result payload for each chip. Pure function — given the
 * chip key + current data, return the static result. No state.
 *
 * Each result is an array of strings (one per "line" rendered in the
 * terminal). The typewriter walks each line in sequence.
 */
function buildPayload(key: ChipKey): string[] {
  switch (key) {
    case "whoami": {
      const active = ACTIVE_EXPERIENCE[0];
      const last = COMPLETED_EXPERIENCE[0];
      return [
        "Mahboob Alam — Co-Founder & Backend Engineer.",
        `Currently shipping Taply (NFC + QR business cards) and`,
        `building UnThink (fragment-first knowledge base).`,
        last
          ? `Last role: ${last.company} (${last.period}), ${last.role}.`
          : "—",
        "Based in Bangalore / Chennai. Open to backend / platform roles.",
      ];
    }
    case "projects": {
      const featured = [
        ...PROJECTS.filter((p) => p.status === "live").slice(0, 1),
        ...PROJECTS.filter((p) => p.status === "building").slice(0, 1),
        ...PROJECTS.filter((p) => p.status === "complete" && p.stars && p.stars >= 20)
          .slice(0, 1),
      ];
      return [
        `${featured.length} featured systems (live / building / most-starred):`,
        ...featured.map((p, i) => {
          const num = String(i + 1).padStart(2, " ");
          const status =
            p.status === "live"
              ? "live"
              : p.status === "building"
                ? "build"
                : "ship";
          return `  ${num}  ${status.padEnd(6, " ")} ${p.slug.padEnd(22, " ")} ${p.tagline.split(" — ")[0]}`;
        }),
        "",
        "→ see /work for the full list of 12 systems.",
      ];
    }
    case "stack": {
      const counts = STACK.map((s) => ({
        name: s.name,
        count: s.projects.length,
      }))
        .filter((s) => s.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      return [
        "Top 5 by project count:",
        ...counts.map(
          (c, i) => `  ${i + 1}. ${c.name.padEnd(14, " ")} ${c.count} projects`,
        ),
        "",
        "→ see /stack for the full 25-tech dependency graph.",
      ];
    }
    case "latest": {
      const native = BLOG_POSTS.filter((p) => p.source === "native").slice(0, 5);
      if (native.length === 0) {
        return ["No native posts yet. /writing has Medium cross-posts."];
      }
      return [
        "Latest native posts (The Backend Diaries):",
        ...native.map((p, i) => `  ${i + 1}. ${p.title} (${p.readMin} min)`),
      ];
    }
    case "contact": {
      return [
        "Taply: gettaply.me/p/mehboob",
        "GitHub: github.com/Mahboob-A",
        "LinkedIn: linkedin.com/in/i-mahboob-alam",
        "Medium: imehboob.medium.com",
        "Email: connect.mahboobalam@gmail.com",
        "",
        "→ open /lets-connect for the full contact form.",
      ];
    }
    case "help": {
      return [
        "Available commands:",
        ...CHIP_ORDER.filter((k) => k !== "help").map(
          (k) => `  ${CHIP_LABEL[k].padEnd(10, " ")} — ${helpBlurb(k)}`,
        ),
        "",
        "Click any chip above, or press Esc to clear.",
      ];
    }
  }
}

function helpBlurb(k: Exclude<ChipKey, "help">): string {
  switch (k) {
    case "whoami":
      return "who I am and what I'm shipping";
    case "projects":
      return "list featured systems";
    case "stack":
      return "top techs by project count";
    case "latest":
      return "recent native blog posts";
    case "contact":
      return "everywhere to reach me";
  }
}

export function HeroTerminal() {
  const reduced = useReducedMotion();
  const [activeKey, setActiveKey] = useState<ChipKey | null>(null);
  const [typed, setTyped] = useState<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build full payload text once per active chip change. Walking each
  // character with `setTimeout` is the typewriter. With reduced motion,
  // snap to full text in the same effect (no animation).
  const payload = useMemo(
    () => (activeKey ? buildPayload(activeKey) : []),
    [activeKey],
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (activeKey === null) {
      setTyped("");
      return;
    }
    const full = payload.join("\n");
    if (reduced) {
      setTyped(full);
      return;
    }
    setTyped("");
    let i = 0;
    const tick = () => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i < full.length) {
        timerRef.current = setTimeout(tick, 12);
      }
    };
    timerRef.current = setTimeout(tick, 12);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeKey, payload, reduced]);

  // Esc listener — clears the active chip / result.
  useEffect(() => {
    if (activeKey === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveKey(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeKey]);

  const onChipClick = (key: ChipKey) => {
    setActiveKey(key);
  };

  const onClear = () => {
    setActiveKey(null);
  };

  return (
    <div ref={containerRef} className="mt-6">
      <TerminalBlock label="terminal · click a command">
        {/* Chip row */}
        <div
          className="flex flex-wrap gap-1.5 pb-3"
          role="group"
          aria-label="Terminal commands"
        >
          {CHIP_ORDER.map((k) => {
            const isActive = activeKey === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onChipClick(k)}
                aria-pressed={isActive}
                className={[
                  "border-border inline-flex items-center rounded-[4px] border px-2.5 py-1 font-mono text-[11.5px] font-medium tracking-[0.5px] transition-colors",
                  isActive
                    ? "bg-acc-dim text-acc border-acc/40"
                    : "text-t2 hover:border-acc/40 hover:text-acc",
                ].join(" ")}
              >
                [{CHIP_LABEL[k]}]
              </button>
            );
          })}
          {activeKey !== null ? (
            <button
              type="button"
              onClick={onClear}
              className="border-border text-t3 hover:text-t1 ml-auto inline-flex items-center rounded-[4px] border px-2.5 py-1 font-mono text-[11px] transition-colors"
              aria-label="Clear terminal output"
            >
              clear ×
            </button>
          ) : null}
        </div>

        {/* Result block */}
        {activeKey !== null ? (
          <div
            className="border-border mt-1 border-t pt-3"
            aria-live="polite"
          >
            <pre className="hero-terminal-pre text-t1 m-0 whitespace-pre-wrap font-mono text-[12.5px] leading-[1.55]">
              {typed}
              <span className="hero-terminal-cursor" aria-hidden>
                █
              </span>
            </pre>
            {activeKey === "contact" ? (
              <Link
                href="/lets-connect"
                className="text-acc mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] hover:opacity-80"
              >
                open /lets-connect →
              </Link>
            ) : null}
          </div>
        ) : (
          <p className="text-t3 mt-1 font-mono text-[11.5px] italic">
            Click a chip above to run a command.
          </p>
        )}
      </TerminalBlock>
    </div>
  );
}