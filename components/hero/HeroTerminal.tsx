/**
 * components/hero/HeroTerminal.tsx
 *
 * Interactive terminal under the Hero's Algocode diagram on the landing
 * page. Phase 7 (T7.6) shipped the static v1 — pre-canned payloads per
 * command chip. Phase 33 adds the **dynamic** mode toggle: the same chip
 * row, but the chip click now fetches `/api/rag` and streams the answer
 * into the same typewriter block.
 *
 * Modes:
 *   - `static`  — default. The pre-canned payloads from data/*.ts
 *                 registries; unchanged from Phase 7.
 *   - `dynamic` — opt-in. Each chip fires `POST /api/rag` with
 *                 `{ command }` and streams the response into the
 *                 terminal body. AbortSignal cancels on chip switch,
 *                 Esc, or mode flip.
 *
 * Design rules (master §6):
 *   - Component state only — no localStorage, no cookie.
 *   - Honors `useReducedMotion()` for cursor blink.
 *   - Server-only packages (upstash / openai) stay server-side via
 *     `/api/rag`; this component never imports them.
 */

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { PROJECTS } from "@/data/projects";
import { STACK } from "@/data/stack";
import { ACTIVE_EXPERIENCE, COMPLETED_EXPERIENCE } from "@/data/experience";
import { BLOG_POSTS } from "@/data/blog";
import {
  RAG_COMMAND_KEYS,
  RAG_COMMAND_LABEL,
  isRagCommand,
  questionForCommand,
  type RagCommandKey,
} from "@/lib/rag/command-map";
import "./HeroTerminal.css";

type Mode = "static" | "dynamic";
type DynamicPhase = "idle" | "loading" | "streaming" | "done" | "error";

const STATIC_CHIP_KEYS = RAG_COMMAND_KEYS;

function buildPayload(key: RagCommandKey): string[] {
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
        ...STATIC_CHIP_KEYS.filter((k) => k !== "help").map(
          (k) => `  ${RAG_COMMAND_LABEL[k].padEnd(10, " ")} — ${helpBlurb(k)}`,
        ),
        "",
        "Click any chip above, or press Esc to clear.",
      ];
    }
  }
}

function helpBlurb(k: Exclude<RagCommandKey, "help">): string {
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

export interface HeroTerminalProps {
  className?: string;
}

export function HeroTerminal({ className }: HeroTerminalProps = {}) {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("static");
  const [activeKey, setActiveKey] = useState<RagCommandKey | null>(null);

  /* ── Static-mode state ─────────────────────────────────────────────── */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [typed, setTyped] = useState<string>("");
  const staticPayload = useMemo(
    () => (activeKey ? buildPayload(activeKey) : []),
    [activeKey],
  );
  useEffect(() => {
    if (mode !== "static") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (activeKey === null) {
      setTyped("");
      return;
    }
    const full = staticPayload.join("\n");
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
  }, [mode, activeKey, staticPayload, reduced]);

  /* ── Dynamic-mode state ────────────────────────────────────────────── */
  const [dynPhase, setDynPhase] = useState<DynamicPhase>("idle");
  const [dynText, setDynText] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const startDynamic = useCallback(
    async (key: RagCommandKey) => {
      // Cancel any in-flight stream before starting a new one.
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setDynPhase("loading");
      setDynText("");

      try {
        const resp = await fetch("/api/rag", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            command: key,
            question: questionForCommand(key),
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          // Render the error body (e.g. "Dynamic mode is not configured yet.")
          // directly as terminal text. Truncate to 400 chars so a runaway
          // 503 message can't blow up the layout.
          const message = await safeReadText(resp).catch(() => "");
          const text = message || `${resp.status} ${resp.statusText}`;
          setDynText(text.slice(0, 400));
          setDynPhase("error");
          return;
        }

        setDynPhase("streaming");
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        // Flush state immediately so the loading phase doesn't blink.
        setDynText("");
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setDynText(acc);
        }
        setDynPhase("done");
      } catch (error) {
        if (controller.signal.aborted) {
          // Quiet reset; user cancelled or switched chip/mode.
          setDynText("");
          setDynPhase("idle");
          return;
        }
        setDynText(
          error instanceof Error
            ? error.message.slice(0, 400)
            : "Request failed.",
        );
        setDynPhase("error");
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [],
  );

  /* Cancel any active stream when the component unmounts, mode flips,
     or the active key changes mid-flight. */
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (mode === "static") {
      if (abortRef.current) abortRef.current.abort();
      setDynText("");
      setDynPhase("idle");
    }
  }, [mode]);

  /* ── Esc listener (both modes) ─────────────────────────────────────── */
  useEffect(() => {
    if (activeKey === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (abortRef.current) abortRef.current.abort();
        setActiveKey(null);
        setDynPhase("idle");
        setDynText("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeKey]);

  const onChipClick = (key: RagCommandKey) => {
    setActiveKey(key);
    if (mode === "dynamic") {
      void startDynamic(key);
    }
  };

  const onClear = () => {
    if (abortRef.current) abortRef.current.abort();
    setActiveKey(null);
    setDynText("");
    setDynPhase("idle");
  };

  const onModeChange = (next: Mode) => {
    if (abortRef.current) abortRef.current.abort();
    setActiveKey(null);
    setDynText("");
    setDynPhase("idle");
    setMode(next);
  };

  const showStaticBody = mode === "static" && activeKey !== null;
  const showDynamicBody = mode === "dynamic" && activeKey !== null;
  const showDynamicIdle =
    mode === "dynamic" && activeKey === null && dynPhase === "idle";
  const showDynamicLoading =
    mode === "dynamic" && activeKey !== null && dynPhase === "loading";
  const showDynamicError =
    mode === "dynamic" && activeKey !== null && dynPhase === "error";

  return (
    <div className="mt-6">
      <TerminalBlock label="terminal">
        {/* Mode toggle + chip row */}
        <div className="flex flex-wrap items-center gap-1.5 pb-3">
          <span
            className="text-t3 mr-1 font-mono text-[11px]"
            aria-hidden
          >
            mode:
          </span>
          <ModeButton current={mode} value="static" onSelect={onModeChange}>
            static
          </ModeButton>
          <ModeButton current={mode} value="dynamic" onSelect={onModeChange}>
            dynamic
          </ModeButton>
          <span aria-hidden className="mx-2 hidden h-4 w-px bg-border sm:inline-block" />
          <span
            role="group"
            aria-label="Terminal commands"
            className="flex flex-wrap gap-1.5"
          >
            {STATIC_CHIP_KEYS.map((k) => {
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
                  [{RAG_COMMAND_LABEL[k]}]
                </button>
              );
            })}
          </span>
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

        {/* Body */}
        {showStaticBody ? (
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
        ) : null}

        {showDynamicIdle ? (
          <div
            className="border-border mt-1 border-t pt-3"
            aria-live="polite"
          >
            <p className="text-t2 m-0 font-mono text-[12.5px] leading-[1.55]">
              <span className="text-t3">$ </span>
              <span className="text-acc">mehboob@portfolio-bastion</span>
              <span className="text-t3">:</span>
              <span className="hero-terminal-cursor" aria-hidden>
                {" "}█
              </span>
            </p>
            <p className="text-t3 mt-2 font-mono text-[11.5px] italic">
              Click a chip above to ask. Press Esc to clear.
            </p>
          </div>
        ) : null}

        {showDynamicLoading ? (
          <div
            className="border-border mt-1 border-t pt-3"
            aria-live="polite"
          >
            <p className="text-t3 m-0 font-mono text-[12.5px] italic">
              thinking…
            </p>
          </div>
        ) : null}

        {showDynamicBody &&
        !showDynamicLoading &&
        !showDynamicError &&
        dynPhase !== "idle" ? (
          <div
            className="border-border mt-1 border-t pt-3"
            aria-live="polite"
          >
            <pre className="hero-terminal-pre text-t1 m-0 whitespace-pre-wrap font-mono text-[12.5px] leading-[1.55]">
              {dynText}
              {dynPhase === "streaming" ? (
                <span className="hero-terminal-cursor" aria-hidden>
                  █
                </span>
              ) : null}
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
        ) : null}

        {showDynamicError ? (
          <div
            className="border-border mt-1 border-t pt-3"
            aria-live="polite"
          >
            <pre className="hero-terminal-pre text-t3 m-0 whitespace-pre-wrap font-mono text-[12.5px] leading-[1.55]">
              {dynText || "Request failed."}
            </pre>
          </div>
        ) : null}

        {/* Empty-state hint (only when nothing has run) */}
        {activeKey === null && dynPhase === "idle" ? (
          <p className="text-t3 mt-1 font-mono text-[11.5px] italic">
            {mode === "static"
              ? "Click a chip above to run a command."
              : "Switch to dynamic and click a chip to ask the LLM."}
          </p>
        ) : null}
      </TerminalBlock>
    </div>
  );
}

function ModeButton({
  current,
  value,
  onSelect,
  children,
}: {
  current: Mode;
  value: Mode;
  onSelect: (next: Mode) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={active}
      className={[
        "border-border inline-flex items-center rounded-[4px] border px-2.5 py-1 font-mono text-[11px] tracking-[0.5px] transition-colors",
        active
          ? "bg-acc-dim text-acc border-acc/40"
          : "text-t2 hover:border-acc/40 hover:text-acc",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

async function safeReadText(resp: Response): Promise<string> {
  // The route returns plain text bodies on non-200 status. Read up to
  // 2KB so a streaming error doesn't blow up the layout.
  if (!resp.body) return "";
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    if (acc.length > 2000) break;
  }
  return acc;
}

// `isRagCommand` is imported for type narrowing only; we don't need to
// call it at runtime because the chip keys are typed `RagCommandKey`.
// Keeping the import documented in case a future feature routes freeform
// text through the same predicate.
void isRagCommand;