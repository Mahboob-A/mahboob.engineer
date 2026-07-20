/**
 * components/hero/HeroTerminal.tsx
 *
 * Interactive terminal under the Hero's Algocode diagram on the landing page.
 * Phase 37 update:
 *   - Mode selection pills ("Static" / "Dynamic") centered in the terminal header bar.
 *   - Predefined command chips shown ONLY in Static mode.
 *   - Dynamic mode renders an interactive `$ mahboob@portfolio-bastion:` text prompt
 *     with an input field where users can ask any freeform question about Mahboob.
 *   - Dynamic query loading state cycles through 24 Claude Code technical thinking
 *     phrases every 2.5s with animated trailing dots and CSS shimmer animation.
 *   - Hardened streaming error handling and 100-120 word response count guidance.
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
  questionForCommand,
  type RagCommandKey,
} from "@/lib/rag/command-map";
import { cn } from "@/lib/cn";
import "./HeroTerminal.css";

type Mode = "static" | "dynamic";
type DynamicPhase = "idle" | "loading" | "streaming" | "done" | "error";

const STATIC_CHIP_KEYS = RAG_COMMAND_KEYS;

const THINKING_PHRASES = [
  "Synthesizing architectural context",
  "Traversing system dependencies",
  "Evaluating vector embeddings",
  "Parsing microservice boundaries",
  "Resolving domain registry",
  "Analyzing blast radius",
  "Inspecting kernel isolation policies",
  "Auditing API contract schemas",
  "Indexing technical documentation",
  "Tracing async event pipelines",
  "Evaluating Redis cache hits",
  "Querying PostgreSQL execution plans",
  "Decomposing monolith boundary",
  "Validating WebRTC signaling path",
  "Mapping HLS transcoding matrix",
  "Reviewing OAuth2 security scope",
  "Scanning Pulumi state graph",
  "Measuring tail latency P99",
  "Optimizing ORM query plan",
  "Verifying cgroup memory limits",
  "Inspecting RabbitMQ queue depth",
  "Synthesizing career timeline",
  "Checking gRPC protocol buffers",
  "Filtering semantic vector hits",
] as const;

function ThinkingText() {
  const [phraseIndex, setPhraseIndex] = useState(() =>
    Math.floor(Math.random() * THINKING_PHRASES.length),
  );
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIndex(
        (prev) =>
          (prev + 1 + Math.floor(Math.random() * (THINKING_PHRASES.length - 1))) %
          THINKING_PHRASES.length,
      );
    }, 2500);

    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 400);

    return () => {
      clearInterval(phraseInterval);
      clearInterval(dotInterval);
    };
  }, []);

  const dots = ".".repeat(dotCount);

  return (
    <span className="hero-terminal-thinking-shimmer font-mono text-[12.5px] font-medium italic">
      {THINKING_PHRASES[phraseIndex]}
      {dots}
    </span>
  );
}

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
        ...PROJECTS.filter(
          (p) => p.status === "complete" && p.stars && p.stars >= 20,
        ).slice(0, 1),
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
  const [activeKey, setActiveKey] = useState<RagCommandKey | "custom" | null>(
    null,
  );

  /* ── Static-mode state ─────────────────────────────────────────────── */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [typed, setTyped] = useState<string>("");
  const staticPayload = useMemo(
    () =>
      activeKey && activeKey !== "custom" ? buildPayload(activeKey) : [],
    [activeKey],
  );

  useEffect(() => {
    if (mode !== "static") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (activeKey === null || activeKey === "custom") {
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
  const [inputVal, setInputVal] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startDynamic = useCallback(
    async (cmdKey: RagCommandKey | "custom", userQuery?: string) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setDynPhase("loading");
      setDynText("");

      const questionText =
        userQuery && userQuery.trim().length > 0
          ? userQuery.trim()
          : cmdKey !== "custom"
            ? questionForCommand(cmdKey)
            : "Summarize Mahboob Alam's software engineering background.";

      try {
        const resp = await fetch("/api/rag", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            command: cmdKey,
            question: questionText,
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
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
        setDynText("");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setDynText(acc);
        }

        if (!acc.trim()) {
          setDynText("No response received from model. Please try again.");
          setDynPhase("error");
        } else {
          setDynPhase("done");
        }
      } catch (error) {
        if (controller.signal.aborted) {
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

  /* Clean up active stream on unmount */
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  /* Reset dynamic state when switching modes */
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    setActiveKey(null);
    setDynText("");
    setDynPhase("idle");
    setInputVal("");
  }, [mode]);

  /* Esc listener */
  useEffect(() => {
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
  }, []);

  const onChipClick = (key: RagCommandKey) => {
    setActiveKey(key);
  };

  const onClear = () => {
    if (abortRef.current) abortRef.current.abort();
    setActiveKey(null);
    setDynText("");
    setDynPhase("idle");
    setInputVal("");
  };

  const onModeChange = (next: Mode) => {
    if (mode === next) return;
    setMode(next);
  };

  const handleDynamicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputVal.trim();
    if (!query || dynPhase === "loading" || dynPhase === "streaming") return;
    setActiveKey("custom");
    void startDynamic("custom", query);
  };

  const headerCenter = (
    <div className="flex items-center gap-1.5 font-mono text-[11px]">
      <ModeButton current={mode} value="static" onSelect={onModeChange}>
        Static
      </ModeButton>
      <ModeButton current={mode} value="dynamic" onSelect={onModeChange}>
        Dynamic
      </ModeButton>
    </div>
  );

  return (
    <TerminalBlock
      headerCenter={headerCenter}
      className={cn("mt-6", className)}
    >
      {/* Static Mode Chip Row */}
      {mode === "static" ? (
        <div className="flex flex-wrap items-center gap-1.5 pb-3">
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
      ) : null}

      {/* Dynamic Mode Interactive Input Form */}
      {mode === "dynamic" ? (
        <form
          onSubmit={handleDynamicSubmit}
          className="flex w-full flex-wrap items-center gap-2 font-mono text-[12.5px] leading-[1.55]"
        >
          <div className="flex shrink-0 items-center gap-1 select-none">
            <span className="text-t3">$</span>
            <span className="text-acc font-semibold">
              mehboob@portfolio-bastion
            </span>
            <span className="text-t3">:</span>
          </div>
          <div className="flex min-w-[200px] flex-1 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={dynPhase === "loading" || dynPhase === "streaming"}
              placeholder="ask anything about Mahboob's work..."
              className="text-t1 placeholder:text-t3/50 focus:ring-0 w-full border-none bg-transparent font-mono text-[12.5px] outline-none focus:outline-none"
              autoFocus
            />
          </div>
          {inputVal.trim() &&
          dynPhase !== "loading" &&
          dynPhase !== "streaming" ? (
            <button
              type="submit"
              className="bg-acc-dim text-acc border-acc/40 hover:bg-acc/20 shrink-0 rounded border px-2 py-0.5 font-mono text-[11px] transition-colors"
            >
              ↵ Send
            </button>
          ) : null}
          {dynPhase !== "idle" ? (
            <button
              type="button"
              onClick={onClear}
              className="border-border text-t3 hover:text-t1 border px-2 py-0.5 rounded font-mono text-[11px] transition-colors ml-auto shrink-0"
              aria-label="Clear terminal output"
            >
              clear ×
            </button>
          ) : null}
        </form>
      ) : null}

      {/* Static Mode Output */}
      {mode === "static" && activeKey !== null && activeKey !== "custom" ? (
        <div className="border-border mt-2 border-t pt-3" aria-live="polite">
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

      {/* Dynamic Mode Thinking State */}
      {mode === "dynamic" &&
      (dynPhase === "loading" ||
        (dynPhase === "streaming" && dynText === "")) ? (
        <div className="border-border mt-3 border-t pt-3" aria-live="polite">
          <p className="m-0 font-mono text-[12.5px]">
            <ThinkingText />
          </p>
        </div>
      ) : null}

      {/* Dynamic Mode Streaming Content Output */}
      {mode === "dynamic" && dynText.length > 0 && dynPhase !== "error" ? (
        <div className="border-border mt-3 border-t pt-3" aria-live="polite">
          <pre className="hero-terminal-pre text-t1 m-0 whitespace-pre-wrap font-mono text-[12.5px] leading-[1.55]">
            {dynText}
            {dynPhase === "streaming" ? (
              <span className="hero-terminal-cursor" aria-hidden>
                █
              </span>
            ) : null}
          </pre>
        </div>
      ) : null}

      {/* Dynamic Mode Error Output */}
      {mode === "dynamic" && dynPhase === "error" ? (
        <div className="border-border mt-3 border-t pt-3" aria-live="polite">
          <pre className="hero-terminal-pre text-t3 m-0 whitespace-pre-wrap font-mono text-[12.5px] leading-[1.55]">
            {dynText || "No response received from model. Please try again."}
          </pre>
        </div>
      ) : null}

      {/* Helper Hints */}
      {activeKey === null && dynPhase === "idle" ? (
        <p className="text-t3 mt-2 font-mono text-[11.5px] italic">
          {mode === "static"
            ? "Click a chip above to run a static command."
            : "Type a question above to query Mahboob's RAG knowledge base."}
        </p>
      ) : null}
    </TerminalBlock>
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
          ? "bg-acc-dim text-acc border-acc/40 font-semibold"
          : "text-t2 hover:border-acc/40 hover:text-acc",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

async function safeReadText(resp: Response): Promise<string> {
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