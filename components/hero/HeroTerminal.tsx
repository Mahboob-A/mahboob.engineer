/**
 * components/hero/HeroTerminal.tsx
 *
 * Interactive terminal under the Hero's Algocode diagram on the landing page.
 * Phase 45 update:
 *   - Pinned input bar (`mahboob@engineer:`) flush at the bottom edge of the terminal frame (`mt-auto shrink-0`).
 *   - Configured chat scroll area with `flex-1 min-h-0 overflow-y-auto` to expand and fill all vertical space above the input bar.
 *   - Locked outer container to `h-[280px] max-h-[280px] overflow-hidden` to guarantee 0 height expansion.
 *   - Preserved 100% frameless, borderless input focus resets (`outline-none focus:ring-0`).
 */

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { PROJECTS } from "@/data/projects";
import { STACK } from "@/data/stack";
import { COMPLETED_EXPERIENCE } from "@/data/experience";
import { BLOG_POSTS } from "@/data/blog";
import {
  RAG_COMMAND_KEYS,
  RAG_COMMAND_LABEL,
  type RagCommandKey,
  isPotentialPromptInjection,
  RAG_REJECTION_MESSAGE,
} from "@/lib/rag/command-map";
import { cn } from "@/lib/cn";
import "./HeroTerminal.css";

type Mode = "static" | "dynamic";
type DynamicPhase = "idle" | "loading" | "streaming" | "done" | "error";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "mahboob_terminal_chat_v1";
const MAX_HISTORY_MESSAGES = 15;

const STATIC_CHIP_KEYS = RAG_COMMAND_KEYS;

const ENGINEER_FALLBACK_VARIANTS = [
  "Sorry, I was deep in the zone mastering Docker internals and missed that. Could you say that again?",
  "My bad, I was completely absorbed in debugging a Linux kernel networking trace. What were you asking?",
  "Lost my train of thought for a second—I was tuning PostgreSQL query execution plans. Mind asking again?",
  "Sorry about that! I was neck-deep in Kubernetes pod scheduling policies. Could you repeat your question?",
  "Apologies, I was tracing an async event pipeline across microservices and got distracted. What did you say?",
  "Whoops, I was optimizing AWS infrastructure auto-scaling capacity and didn't catch that. Say that one more time?",
  "My fault—I was benchmarking WebRTC stream latency and lost context for a moment. Could you rephrase that?",
  "Ah, sorry! I was reading up on distributed consensus protocols and spaced out. What were we talking about?",
] as const;

function getEngineerFallbackMessage(): string {
  const idx = Math.floor(Math.random() * ENGINEER_FALLBACK_VARIANTS.length);
  return ENGINEER_FALLBACK_VARIANTS[idx];
}

const LONG_QUERY_ERROR_VARIANTS = [
  "That's a bit too long! Let's keep it simple and under 120 words so I can parse it cleanly.",
  "Whoa, that's a massive query! Mind breaking it down or keeping it under 120 words?",
  "Sorry, my local database is optimized for concise portfolio questions. Could you please rephrase it to under 120 words?",
  "Too many tokens! Please keep your question under 120 words so I can reply quickly.",
  "Let's keep it brief. Rephrase your question to under 120 words, and I'll be happy to answer.",
] as const;

function getLongQueryErrorMessage(): string {
  const idx = Math.floor(Math.random() * LONG_QUERY_ERROR_VARIANTS.length);
  return LONG_QUERY_ERROR_VARIANTS[idx];
}

const SINGLE_WORD_THINKING_TERMS = [
  "Mehboobing",
  "Mahboobing",
  "Engineering",
  "Waffling",
  "Overtweaking",
  "Catastrophizing",
  "Spiraling",
  "Hedging",
  "Faffing",
  "Kerfuffling",
  "Whatchamacalliting",
  "Bouncing",
  "Discombobulating",
  "Cringing",
  "Gerrymandering",
  "Moonwalking",
  "Guesstimating",
  "Razzmatazzing",
  "Flibbertigibetting",
  "Partying",
  "Combobulating",
  "Sauteeing",
  "Gallivanting",
  "Caffeinating",
  "Levitating",
  "Osmosing",
  "Clauding",
  "Guzzling",
  "Twinkling",
  "Honking",
  "Canoodling",
  "Reticulating",
  "Existentialising",
  "Cooking",
  "Skedaddling",
  "Flexing",
  "Finagling",
  "Stupentifying",
  "Booping",
  "Sloppening",
  "Sensing",
  "Evaporating",
  "Tokening",
  "Procrastinating",
  "Mulling",
  "Gliding",
  "Fishing",
  "Incubating",
  "Curling",
  "Wrangling",
  "Cerebrating",
  "Prestidigitating",
  "Contemplating",
  "Ruminating",
  "Optimizing",
  "Architecting",
  "Refactoring",
  "Profiling",
  "Benchmarking",
  "Compiling",
] as const;

function ThinkingText() {
  const [termIndex, setTermIndex] = useState(() =>
    Math.floor(Math.random() * SINGLE_WORD_THINKING_TERMS.length),
  );
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const termInterval = setInterval(() => {
      setTermIndex(
        (prev) =>
          (prev + 1 + Math.floor(Math.random() * (SINGLE_WORD_THINKING_TERMS.length - 1))) %
          SINGLE_WORD_THINKING_TERMS.length,
      );
    }, 2200);

    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 400);

    return () => {
      clearInterval(termInterval);
      clearInterval(dotInterval);
    };
  }, []);

  const dots = ".".repeat(dotCount);

  return (
    <span className="hero-terminal-thinking-shimmer font-mono text-[12.5px] font-medium italic">
      {SINGLE_WORD_THINKING_TERMS[termIndex]}
      {dots}
    </span>
  );
}

function buildPayload(key: RagCommandKey): string[] {
  switch (key) {
    case "whoami": {
      const last = COMPLETED_EXPERIENCE[0];
      return [
        "Mahboob Alam — Co-Founder & Backend Engineer.",
        `Currently shipping Taply (NFC + QR business cards) and`,
        `building UnThink (fragment-first knowledge base).`,
        last
          ? `Last role: ${last.company} (${last.period}), ${last.role}.`
          : "—",
        "Based in Kolkata (hometown). Open to remote or relocating to Bangalore / Chennai / NCR.",
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
  const [typedIndex, setTypedIndex] = useState<number>(0);
  const staticPayload = useMemo(
    () =>
      activeKey && activeKey !== "custom" ? buildPayload(activeKey) : [],
    [activeKey],
  );

  useEffect(() => {
    if (mode !== "static") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (activeKey === null || activeKey === "custom") {
      // Defer the reset into the setTimeout callback so the React 19
      // `set-state-in-effect` rule allows it (sync setState in effect
      // body triggers cascading renders).
      timerRef.current = setTimeout(() => setTypedIndex(0), 0);
      return;
    }
    const full = staticPayload.join("\n");
    if (reduced) {
      timerRef.current = setTimeout(() => setTypedIndex(full.length), 0);
      return;
    }
    timerRef.current = setTimeout(() => setTypedIndex(0), 0);
    let i = 0;
    const tick = () => {
      i += 1;
      setTypedIndex(i);
      if (i < full.length) {
        timerRef.current = setTimeout(tick, 12);
      }
    };
    timerRef.current = setTimeout(tick, 12);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode, activeKey, staticPayload, reduced]);

  const typed = useMemo(() => {
    if (activeKey === null || activeKey === "custom") return "";
    return staticPayload.join("\n").slice(0, typedIndex);
  }, [activeKey, staticPayload, typedIndex]);

  /* ── Dynamic-mode state & persistent chat history ──────────────────── */
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(-MAX_HISTORY_MESSAGES);
        }
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });
  const [dynPhase, setDynPhase] = useState<DynamicPhase>("idle");
  const [activeStreamingText, setActiveStreamingText] = useState<string>("");
  const [inputVal, setInputVal] = useState<string>("");
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = sessionStorage.getItem("portfolio_rag_session_id");
      if (!id) {
        id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem("portfolio_rag_session_id", id);
      }
      return id;
    }
    return "";
  });
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  /* Save persistent history to sessionStorage with 15-msg auto-trim */
  const updateHistory = useCallback((updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setHistory((prev) => {
      const next = updater(prev).slice(-MAX_HISTORY_MESSAGES);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const startDynamic = useCallback(
    async (cmdKey: RagCommandKey | "custom", userQuery: string) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsgId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: userQuery,
      };

      updateHistory((prev) => [...prev, userMessage]);

      setDynPhase("loading");
      setActiveStreamingText("");
      setInputVal("");

      try {
        const resp = await fetch("/api/rag", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            command: cmdKey,
            question: userQuery,
            sessionId: sessionId || undefined,
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          let errorContent = getEngineerFallbackMessage();
          try {
            const errText = await resp.text();
            if (errText) errorContent = errText;
          } catch {
            // Ignore
          }
          const assistantErrorMsg: ChatMessage = {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: errorContent,
          };
          updateHistory((prev) => [...prev, assistantErrorMsg]);
          setDynPhase("error");
          return;
        }

        if (!resp.body) {
          const assistantErrorMsg: ChatMessage = {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: getEngineerFallbackMessage(),
          };
          updateHistory((prev) => [...prev, assistantErrorMsg]);
          setDynPhase("error");
          return;
        }

        setDynPhase("streaming");
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        setActiveStreamingText("");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setActiveStreamingText(acc);
        }

        const finalText = acc.trim() || getEngineerFallbackMessage();
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: finalText,
        };
        updateHistory((prev) => [...prev, assistantMsg]);
        setActiveStreamingText("");
        setDynPhase("done");
      } catch {
        if (controller.signal.aborted) {
          setActiveStreamingText("");
          setDynPhase("idle");
          return;
        }
        const assistantErrorMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: getEngineerFallbackMessage(),
        };
        updateHistory((prev) => [...prev, assistantErrorMsg]);
        setActiveStreamingText("");
        setDynPhase("error");
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [updateHistory, sessionId],
  );

  /* Silent internal container scroll to bottom (prevents window page jumps) */
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history, activeStreamingText, dynPhase]);

  /* Clean up active stream on unmount */
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  /* Esc listener */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (abortRef.current) abortRef.current.abort();
        setActiveKey(null);
        setDynPhase("idle");
        setActiveStreamingText("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onChipClick = (key: RagCommandKey) => {
    setActiveKey(key);
  };

  const onModeChange = (next: Mode) => {
    if (mode === next) return;
    setMode(next);
  };

  const handleDynamicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputVal.trim();
    if (!query || dynPhase === "loading" || dynPhase === "streaming") return;

    if (isPotentialPromptInjection(query)) {
      const userMsgId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: query,
      };

      const assistantRejectionMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: RAG_REJECTION_MESSAGE,
      };

      updateHistory((prev) => [...prev, userMessage, assistantRejectionMsg]);
      setInputVal("");
      setDynPhase("done");
      return;
    }

    const wordCount = query.split(/\s+/).filter(Boolean).length;
    if (wordCount > 120) {
      const userMsgId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: query,
      };

      const assistantErrorMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: getLongQueryErrorMessage(),
      };

      updateHistory((prev) => [...prev, userMessage, assistantErrorMsg]);
      setInputVal("");
      setDynPhase("error");
      return;
    }

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
      prompt=""
      noPadding
      className={cn("mt-6", className)}
    >
      {/* Static Mode Chips */}
      {mode === "static" ? (
        <div>
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
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
          </div>

          {activeKey !== null && activeKey !== "custom" ? (
            <div className="border-border mt-1 border-t pt-3" aria-live="polite">
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
            <p className="text-t3 mt-2 font-mono text-[11.5px] italic">
              Click a chip above to run a static command.
            </p>
          )}
        </div>
      ) : null}

      {/* Dynamic Mode: Strictly Clamped Height Chat Box + Pinned Bottom Input */}
      {mode === "dynamic" ? (
        <div className="flex flex-col justify-between font-mono text-[12.5px] h-[380px] max-h-[380px] overflow-hidden">
          {/* 1. Scrollable Chat History — flex-1 fills all vertical space above input */}
          <div
            ref={scrollContainerRef}
            className="hero-terminal-scroll flex-1 min-h-0 overflow-y-auto pr-1 mb-2"
          >
            {history.map((msg) => (
              <div key={msg.id} className="mb-3">
                {msg.role === "user" ? (
                  <p className="m-0 flex items-start text-t1 leading-[1.55]">
                    <span className="text-acc font-semibold select-none shrink-0">
                      mahboob@engineer
                    </span>
                    <span className="text-t3 select-none mr-1.5 shrink-0">:</span>
                    <span className="text-t1 font-medium">{msg.content}</span>
                  </p>
                ) : (
                  <div className="mt-1 pl-3 border-l-2 border-acc/40">
                    <pre className="hero-terminal-pre text-t1 m-0 whitespace-pre-wrap font-mono text-[12.5px] leading-[1.55]">
                      {msg.content}
                    </pre>
                  </div>
                )}
              </div>
            ))}

            {/* Render Active Thinking Phrase */}
            {dynPhase === "loading" || (dynPhase === "streaming" && activeStreamingText === "") ? (
              <div className="mb-3 pl-3">
                <p className="m-0 font-mono text-[12.5px]">
                  <ThinkingText />
                </p>
              </div>
            ) : null}

            {/* Render In-Flight Assistant Streaming Stream */}
            {dynPhase === "streaming" && activeStreamingText.length > 0 ? (
              <div className="mb-3 pl-3 border-l-2 border-acc/40" aria-live="polite">
                <pre className="hero-terminal-pre text-t1 m-0 whitespace-pre-wrap font-mono text-[12.5px] leading-[1.55]">
                  {activeStreamingText}
                  <span className="hero-terminal-cursor" aria-hidden>
                    █
                  </span>
                </pre>
              </div>
            ) : null}
          </div>

          {/* 2. Dynamic Input Line — Pinned Flush at Bottom Edge */}
          <form
            onSubmit={handleDynamicSubmit}
            className="mt-auto flex w-full items-center font-mono text-[12.5px] leading-[1.55] pt-2 border-t border-border/30 shrink-0"
          >
            <span className="text-acc hero-terminal-prompt-blink font-semibold select-none shrink-0">
              mahboob@engineer
            </span>
            <span className="text-t3 select-none mr-1.5 shrink-0">:</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={dynPhase === "loading" || dynPhase === "streaming"}
              placeholder="ask anything about Mahboob's work..."
              className="flex-1 bg-transparent text-t1 placeholder:text-t3/40 border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none appearance-none p-0 m-0 font-mono text-[12.5px]"
              autoFocus
            />
          </form>
        </div>
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
        "border-border inline-flex items-center rounded-[4px] border px-2.5 py-1 font-mono text-[11px] tracking-[0.3px] transition-colors",
        active
          ? "bg-acc-dim text-acc border-acc/40 font-semibold"
          : "text-t2 hover:border-acc/40 hover:text-acc",
      ].join(" ")}
    >
      {children}
    </button>
  );
}