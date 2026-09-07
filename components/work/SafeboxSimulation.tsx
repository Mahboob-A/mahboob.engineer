"use client";

/**
 * components/work/SafeboxSimulation.tsx
 *
 * Master Interactive Simulation Arena for Safebox on /work/safebox.
 * Features 3 specialized operational modes:
 *
 *   1. [AGY CLI]: Authentic Antigravity CLI simulator with real ASCII art,
 *      interactive prompt execution, real-time log stream, and live Safebox
 *      change management commands (diff, diff -p, cat, apply, revert).
 *   2. [WATERFALL]: Chrome DevTools Network Waterfall showcasing the 11
 *      microsecond-latency Linux kernel & supervisor startup steps with
 *      expandable syscall inspector drawers.
 *   3. [ATTACK LAB]: Boundary Attack Lab with side-by-side comparison of
 *      malicious workloads (credential theft, rm -rf, remote droppers, fork bombs)
 *      running on Bare Host vs Safebox.
 *
 * Strictly free of emojis and em dashes across all UI and data layers.
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  AGY_SCENARIOS,
  AgyScenario,
  WATERFALL_STEPS,
  WaterfallStep,
  ATTACK_VECTORS,
  AttackVector,
  SAFEBOX_STARTUP_TRACE,
  ANTIGRAVITY_SESSION_BANNER,
  getAntigravityBanner,
  getSafeboxApplyOutput,
  getSafeboxRevertOutput,
  CLI_COMMAND_OUTPUTS,
} from "./safebox-simulation-data";

type ArenaMode = "agy_terminal" | "waterfall" | "attack_lab";

export function SafeboxSimulation() {
  const [activeMode, setActiveMode] = useState<ArenaMode>("agy_terminal");

  return (
    <div className="w-full space-y-6">
      {/* Master Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <span className="bg-acc inline-block h-[7px] w-[7px] rounded-full shadow-[0_0_10px_var(--acc)]" />
          <h2 className="text-t1 font-display text-[18px] font-bold tracking-tight">
            Safebox Simulation Engine
          </h2>
          <span className="text-t3 font-mono text-[11px] hidden sm:inline">
            [v0.5.2 engine]
          </span>
        </div>

        <div className="flex rounded-lg border border-border bg-surface/70 p-1 backdrop-blur-md">
          <button
            onClick={() => setActiveMode("agy_terminal")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-mono rounded-md transition-colors cursor-pointer",
              activeMode === "agy_terminal"
                ? "bg-code-bg text-acc border border-acc/30 shadow-sm font-bold"
                : "text-t3 hover:text-t1"
            )}
          >
            <span className="text-[10px] text-amber font-bold">[1]</span>
            AGY CLI Simulator
          </button>

          <button
            onClick={() => setActiveMode("waterfall")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-mono rounded-md transition-colors cursor-pointer",
              activeMode === "waterfall"
                ? "bg-code-bg text-acc border border-acc/30 shadow-sm font-bold"
                : "text-t3 hover:text-t1"
            )}
          >
            <span className="text-[10px] text-amber font-bold">[2]</span>
            Chrome DevTools Waterfall
          </button>

          <button
            onClick={() => setActiveMode("attack_lab")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-mono rounded-md transition-colors cursor-pointer",
              activeMode === "attack_lab"
                ? "bg-code-bg text-acc border border-acc/30 shadow-sm font-bold"
                : "text-t3 hover:text-t1"
            )}
          >
            <span className="text-[10px] text-amber font-bold">[3]</span>
            Boundary Attack Lab
          </button>
        </div>
      </div>

      {/* Mode Viewport */}
      <div>
        {activeMode === "agy_terminal" && <AgyTerminalView />}
        {activeMode === "waterfall" && <WaterfallView />}
        {activeMode === "attack_lab" && <AttackLabView />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. Antigravity CLI (agy) Terminal View (Interactive Engine)
   ───────────────────────────────────────────────────────────────────────────── */

type SimulationPhase =
  | "unselected"     // Initially blank: scenario choices wait outside
  | "ready_to_launch" // Scenario clicked: launcher command ready
  | "booting_trace"   // Streaming Safebox startup trace in slow-mo
  | "signing_in"      // Animated braille spinner: ⣾ Signing in...
  | "session_ready"   // Session banner rendered + task prompt in input field
  | "executing_task"  // Thinking block with ticking tokens + streaming tools
  | "completed";      // All execution logs complete + change control toolbar active

const SPINNER_FRAMES = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];

const DEFAULT_SESSION = {
  sessionId: "sess-1788798423580814662",
  sessionFullId: "sess-1788798423580814662-396505",
  sessionMergedPath: "/tmp/safebox/sessions/sess-1788798423580814662-396505/merged",
};

function generateRandomSession() {
  const part1 = Math.floor(1000000000000000000 + Math.random() * 8999999999999999999).toString();
  const part2 = Math.floor(100000 + Math.random() * 900000).toString();
  const sessionId = `sess-${part1}`;
  const sessionFullId = `sess-${part1}-${part2}`;
  const sessionMergedPath = `/tmp/safebox/sessions/${sessionFullId}/merged`;
  return { sessionId, sessionFullId, sessionMergedPath };
}

function cleanLogText(text: string): string {
  return text.replace(/^[●•]\s*/, "");
}

function AgyTerminalView() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [simPhase, setSimPhase] = useState<SimulationPhase>("unselected");
  const [activeOutputPanel, setActiveOutputPanel] = useState<
    "logs" | "diff" | "patch" | "status"
  >("logs");

  const [currentSession, setCurrentSession] = useState(DEFAULT_SESSION);

  const [streamedTraceLines, setStreamedTraceLines] = useState<string[]>([]);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [thoughtSec, setThoughtSec] = useState(1);
  const [thoughtTokens, setThoughtTokens] = useState(150);
  const [isThinkingComplete, setIsThinkingComplete] = useState(false);
  const [streamedLogCount, setStreamedLogCount] = useState(0);

  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);
  const [lastActionCommand, setLastActionCommand] = useState<string>("safebox status");
  const [inputCommand, setInputCommand] = useState("");
  const terminalScrollContainerRef = useRef<HTMLDivElement>(null);

  const scenario = AGY_SCENARIOS.find((s) => s.id === selectedScenarioId) || null;

  // Auto-scroll inside terminal as logs stream without moving browser window
  useEffect(() => {
    if (terminalScrollContainerRef.current) {
      terminalScrollContainerRef.current.scrollTop =
        terminalScrollContainerRef.current.scrollHeight;
    }
  }, [simPhase, streamedTraceLines, isThinkingComplete, streamedLogCount, activeOutputPanel, commandFeedback]);

  // Handle Scenario Choice (from outside the terminal)
  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setCurrentSession(generateRandomSession());
    setSimPhase("ready_to_launch");
    setStreamedTraceLines([]);
    setSpinnerFrame(0);
    setThoughtSec(1);
    setThoughtTokens(150);
    setIsThinkingComplete(false);
    setStreamedLogCount(0);
    setActiveOutputPanel("logs");
    setCommandFeedback(null);
    setLastActionCommand("safebox status");
    setInputCommand("");
  };

  // Launch Safebox trace sequence
  const handleLaunchSafebox = () => {
    if (!scenario || simPhase !== "ready_to_launch") return;
    setSimPhase("booting_trace");
    setStreamedTraceLines([]);
    setCurrentSession(generateRandomSession());

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < SAFEBOX_STARTUP_TRACE.length) {
        const nextLine = SAFEBOX_STARTUP_TRACE[lineIndex];
        setStreamedTraceLines((prev) => [...prev, nextLine]);
        lineIndex++;
      } else {
        clearInterval(interval);
        setSimPhase("signing_in");
      }
    }, 110);
  };

  // Animated braille sign-in spinner
  useEffect(() => {
    if (simPhase !== "signing_in") return;
    let ticks = 0;
    const spinnerInterval = setInterval(() => {
      setSpinnerFrame((prev) => (prev + 1) % SPINNER_FRAMES.length);
      ticks++;
      if (ticks > 18) {
        clearInterval(spinnerInterval);
        setSimPhase("session_ready");
      }
    }, 75);

    return () => clearInterval(spinnerInterval);
  }, [simPhase]);

  // Execute scenario task prompt
  const handleExecuteTask = () => {
    if (!scenario || simPhase !== "session_ready") return;
    setSimPhase("executing_task");
    setThoughtSec(1);
    setIsThinkingComplete(false);
    setStreamedLogCount(0);

    const targetSec = scenario.thoughtSeconds;
    const targetTok = scenario.thoughtTokens;
    let currentSec = 1;

    // Fast-paced thinking progression (ticks every 220ms up to target seconds)
    const thoughtInterval = setInterval(() => {
      currentSec++;
      setThoughtSec(currentSec);
      setThoughtTokens(
        Math.min(targetTok, Math.round((currentSec / targetSec) * targetTok))
      );

      if (currentSec >= targetSec) {
        clearInterval(thoughtInterval);
        setIsThinkingComplete(true);

        // Stream tool logs sequentially
        let logIndex = 0;
        const totalLogs = scenario.agyLogStream.length;
        const logInterval = setInterval(() => {
          logIndex++;
          setStreamedLogCount(logIndex);
          if (logIndex >= totalLogs) {
            clearInterval(logInterval);
            setSimPhase("completed");
          }
        }, 180);
      }
    }, 220);
  };

  // Change management actions
  const handleApply = () => {
    setActiveOutputPanel("status");
    setLastActionCommand("safebox apply --yes");
    if (scenario) {
      setCommandFeedback(getSafeboxApplyOutput(scenario, currentSession.sessionId));
    }
  };

  const handleRevert = () => {
    setActiveOutputPanel("status");
    setLastActionCommand("safebox revert --yes");
    if (scenario) {
      setCommandFeedback(getSafeboxRevertOutput(scenario, currentSession.sessionId));
    }
  };

  const handleTerminalInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputCommand.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === "safebox diff" || cmd === "diff") {
      setActiveOutputPanel("diff");
      setLastActionCommand("safebox diff");
    } else if (cmd === "safebox diff -p" || cmd === "diff -p" || cmd === "patch") {
      setActiveOutputPanel("patch");
      setLastActionCommand("safebox diff -p");
    } else if (cmd.includes("apply")) {
      handleApply();
    } else if (cmd.includes("revert")) {
      handleRevert();
    } else if (cmd === "clear" || cmd === "logs" || cmd === "exit") {
      setActiveOutputPanel("logs");
      setCommandFeedback(null);
    } else {
      setLastActionCommand(inputCommand.trim());
      setActiveOutputPanel("status");
      setCommandFeedback(`$ ${inputCommand.trim()}\n-> Command executed inside safebox container sandbox.`);
    }

    setInputCommand("");
  };

  return (
    <div className="w-full space-y-4">
      {/* ───── Outside Scenario Selector Buttons ───── */}
      <div className="rounded-xl border border-border bg-surface/70 p-4 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-amber font-mono text-[11px] font-bold uppercase tracking-wider">
            Select Agent Scenario:
          </span>
          <span className="text-t3 font-mono text-[11px] hidden sm:inline">
            Click scenario to stage container command
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {AGY_SCENARIOS.map((sc, idx) => {
            const isSelected = selectedScenarioId === sc.id;
            const letter = String.fromCharCode(65 + idx);
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                className={cn(
                  "flex flex-col text-left p-3 rounded-lg border font-mono transition-all cursor-pointer relative",
                  isSelected
                    ? "bg-surface border-acc shadow-[0_0_15px_rgba(92,201,160,0.12)] text-t1 ring-1 ring-acc/50"
                    : "bg-code-bg/60 border-border text-t3 hover:text-t1 hover:border-border-strong hover:bg-surface/50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-acc font-bold text-[11px]">
                    [{letter}] {sc.category.toUpperCase()}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] bg-acc/15 text-acc border border-acc/30 px-1.5 py-0.2 rounded font-semibold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <span className="font-display font-semibold text-[13px] text-t1 leading-snug">
                  {sc.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ───── Terminal Window ───── */}
      <div className="rounded-2xl border border-border bg-code-bg overflow-hidden shadow-2xl flex flex-col font-mono text-[12.5px]">
        {/* Window Chrome Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-border bg-surface/90 px-4 py-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#EF4444]/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-[#10B981]/80 inline-block" />
            </div>
            <span suppressHydrationWarning className="text-t3 font-mono text-[12px] ml-2">
              safebox: {currentSession.sessionId} (PID 1 shim)
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="rounded bg-acc/10 border border-acc/20 px-2 py-0.5 text-acc">
              net: isolated
            </span>
            <span className="rounded bg-amber/10 border border-amber/20 px-2 py-0.5 text-amber">
              lsm: landlock-v3
            </span>
            <span className="rounded bg-surface border border-border px-2 py-0.5 text-t2">
              starter-quota
            </span>
          </div>
        </div>

        {/* Change Control Toolbar (Only visible when ready or completed) */}
        {(simPhase === "completed" || simPhase === "session_ready") && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-surface/40 px-4 py-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveOutputPanel("logs")}
                className={cn(
                  "px-2.5 py-1 text-[11px] rounded transition-colors cursor-pointer",
                  activeOutputPanel === "logs"
                    ? "bg-surface border border-border text-t1 font-semibold"
                    : "text-t3 hover:text-t2"
                )}
              >
                Execution Logs
              </button>
              <button
                onClick={() => {
                  setActiveOutputPanel("diff");
                  setLastActionCommand("safebox diff");
                }}
                className={cn(
                  "px-2.5 py-1 text-[11px] rounded transition-colors cursor-pointer",
                  activeOutputPanel === "diff"
                    ? "bg-surface border border-border text-t1 font-semibold"
                    : "text-t3 hover:text-t2"
                )}
              >
                safebox diff ({scenario ? scenario.diffSummary.length : 0})
              </button>
              <button
                onClick={() => {
                  setActiveOutputPanel("patch");
                  setLastActionCommand("safebox diff -p");
                }}
                className={cn(
                  "px-2.5 py-1 text-[11px] rounded transition-colors cursor-pointer",
                  activeOutputPanel === "patch"
                    ? "bg-surface border border-border text-t1 font-semibold"
                    : "text-t3 hover:text-t2"
                )}
              >
                diff -p
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApply}
                className="px-2.5 py-1 rounded bg-acc/10 border border-acc/30 text-acc text-[11px] font-semibold hover:bg-acc/20 transition-colors cursor-pointer"
              >
                apply
              </button>
              <button
                onClick={handleRevert}
                className="px-2.5 py-1 rounded bg-amber/10 border border-amber/30 text-amber text-[11px] font-semibold hover:bg-amber/20 transition-colors cursor-pointer"
              >
                revert
              </button>
              {selectedScenarioId && (
                <button
                  onClick={() => handleSelectScenario(selectedScenarioId)}
                  className="px-2 py-1 text-t3 hover:text-t1 text-[11px] transition-colors cursor-pointer ml-1"
                >
                  ↺ reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* Terminal Body Screen */}
        <div
          ref={terminalScrollContainerRef}
          className="p-5 space-y-4 min-h-[540px] max-h-[720px] overflow-y-auto"
        >
          {/* Phase 0: Blank Terminal */}
          {simPhase === "unselected" && (
            <div className="h-[480px] flex flex-col items-center justify-center text-center space-y-2">
              <div className="text-t3 font-mono text-[13px]">
                $ # Select an agent scenario above to launch the microsecond sandbox...
              </div>
              <p className="text-t3/60 text-[11.5px] max-w-md">
                Safebox establishes rootless Linux namespaces, ephemeral OverlayFS, and Landlock LSM default-deny rules before handing off to the untrusted agent CLI.
              </p>
            </div>
          )}

          {/* Phase 1: Clickable Launcher Command */}
          {simPhase === "ready_to_launch" && scenario && (
            <div className="space-y-4 py-3">
              <div className="text-t3 text-[11px] uppercase tracking-wider">
                Container Launch Command:
              </div>
              <button
                onClick={handleLaunchSafebox}
                className="w-full group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-acc/40 bg-surface/80 p-4 text-left hover:border-acc hover:bg-surface transition-all cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-2 text-t1 font-mono text-[13.5px]">
                  <span className="text-acc font-bold">$</span>
                  <span className="group-hover:text-acc transition-colors">
                    {scenario.command}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-md bg-acc/15 border border-acc/30 px-3 py-1 text-[11px] font-mono text-acc font-semibold">
                  <span className="inline-block h-2 w-2 rounded-full bg-acc animate-ping" />
                  Click to run command ↵
                </div>
              </button>
              <p className="text-t3 text-[11px] italic">
                Launches Go supervisor, attaches user namespaces, mounts unprivileged OverlayFS scratchpad, and locks privileges via PR_SET_NO_NEW_PRIVS.
              </p>
            </div>
          )}

          {/* Clean Standalone Terminal View for diff, patch, apply, revert (No AGY startup logs) */}
          {simPhase !== "unselected" && simPhase !== "ready_to_launch" && scenario && activeOutputPanel !== "logs" && (
            <div className="space-y-4 py-1 font-mono">
              {/* Standalone Command Prompt */}
              <div className="text-t1 font-mono text-[13px] flex items-center gap-2">
                <span className="text-acc font-bold">$</span>
                <span className="font-semibold text-t1">
                  {activeOutputPanel === "diff"
                    ? "safebox diff"
                    : activeOutputPanel === "patch"
                    ? "safebox diff -p"
                    : lastActionCommand}
                </span>
              </div>

              {/* diff view */}
              {activeOutputPanel === "diff" && (
                <div className="space-y-3 font-mono">
                  {scenario.diffSummary.length === 0 ? (
                    <p className="text-t3 italic">
                      Zero modifications detected in upperdir scratchpad. Ephemeral overlayfs is pristine.
                    </p>
                  ) : (
                    <div className="rounded-lg border border-border bg-bg/80 p-3 space-y-3">
                      <p className="text-t3 text-[11px] uppercase tracking-wider">
                        Upperdir Staged File Summary:
                      </p>
                      <div className="space-y-1.5">
                        {scenario.diffSummary.map((d, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[12.5px] py-0.5 border-b border-border/20 last:border-0"
                          >
                            <span
                              className={
                                d.status === "ADDED"
                                  ? "text-acc font-semibold"
                                  : d.status === "MODIFIED"
                                  ? "text-t1 font-semibold"
                                  : "text-amber font-semibold"
                              }
                            >
                              [{d.status.padEnd(8)}] {d.path}
                            </span>
                            <span className="text-t3 font-mono text-[11.5px]">
                              +{d.insertions} / -{d.deletions}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-t3 text-[11.5px] pt-2 border-t border-border/40 flex items-center justify-between">
                        <span>
                          {scenario.diffSummary.length} {scenario.diffSummary.length === 1 ? "file" : "files"} changed,{" "}
                          {scenario.diffSummary.reduce((acc, d) => acc + d.insertions, 0)} insertions(+),{" "}
                          {scenario.diffSummary.reduce((acc, d) => acc + d.deletions, 0)} deletions(-)
                        </span>
                        <span className="text-acc font-semibold text-[11px]">
                          uncommitted overlayfs scratchpad
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* patch view */}
              {activeOutputPanel === "patch" && (
                <div className="space-y-2">
                  <div className="text-t3 text-[11px] uppercase tracking-wider">
                    Unified Diff Patch:
                  </div>
                  <pre className="rounded-lg border border-border bg-bg/90 p-4 overflow-x-auto text-[12px] leading-relaxed">
                    <code>
                      {scenario.patchDiff.split("\n").map((line, i) => {
                        let colorClass = "text-t2";
                        if (line.startsWith("+") && !line.startsWith("+++")) colorClass = "text-acc font-semibold";
                        if (line.startsWith("-") && !line.startsWith("---")) colorClass = "text-amber font-semibold";
                        if (line.startsWith("@@")) colorClass = "text-t3 italic";
                        return (
                          <span key={i} className={`block ${colorClass}`}>
                            {line}
                          </span>
                        );
                      })}
                    </code>
                  </pre>
                </div>
              )}

              {/* status view (apply / revert) */}
              {activeOutputPanel === "status" && commandFeedback && (
                <div className="space-y-2">
                  <pre className="rounded-lg border border-border bg-bg/90 p-4 text-t1 text-[12.5px] whitespace-pre-wrap leading-relaxed">
                    <code>{commandFeedback}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Phase 2+: AGY Session Trace Output (Only visible when activeOutputPanel === "logs") */}
          {simPhase !== "unselected" && simPhase !== "ready_to_launch" && scenario && activeOutputPanel === "logs" && (
            <div className="space-y-2">
              {/* Launcher Command echoed */}
              <div className="text-t2 text-[12.5px]">
                <span className="text-acc font-bold">$</span> {scenario.command}
              </div>

              {/* Startup Trace Lines */}
              <div className="space-y-1 text-[12px] text-t3 leading-relaxed">
                {streamedTraceLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.startsWith("->")
                        ? "text-t2 font-medium"
                        : line.startsWith("Welcome")
                        ? "text-t1 font-semibold pt-1"
                        : "text-t3"
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Animated Braille Spinner for signing in */}
              {simPhase === "signing_in" && (
                <div className="flex items-center gap-2 text-acc font-semibold text-[13px] pt-1">
                  <span className="text-amber text-[14px]">
                    {SPINNER_FRAMES[spinnerFrame]}
                  </span>
                  <span>Signing in...</span>
                </div>
              )}

              {/* Antigravity Session Banner with dynamic scenario path */}
              {(simPhase === "session_ready" ||
                simPhase === "executing_task" ||
                simPhase === "completed") && (
                <div className="py-2 border-y border-border/40 my-3">
                  <pre className="font-mono text-acc leading-tight text-[11px] md:text-[12px] overflow-x-auto selection:bg-acc/20 font-medium opacity-95">
                    <code suppressHydrationWarning>{getAntigravityBanner(currentSession.sessionMergedPath)}</code>
                  </pre>
                </div>
              )}

              {/* Prompt Ready in Input State */}
              {simPhase === "session_ready" && (
                <div className="space-y-3 pt-2">
                  <div className="text-t3 text-[11px] uppercase tracking-wider">
                    Agent Input Task Ready:
                  </div>
                  <button
                    onClick={handleExecuteTask}
                    className="w-full group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-acc/40 bg-surface/80 p-3.5 text-left hover:border-acc hover:bg-surface transition-all cursor-pointer shadow-md"
                  >
                    <div className="flex items-center gap-2.5 text-t1 font-mono text-[13px]">
                      <span className="text-acc font-bold">&gt;</span>
                      <span className="group-hover:text-acc transition-colors">
                        {scenario.prompt}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-acc/15 border border-acc/30 px-3 py-1 text-[11px] font-mono text-acc font-semibold">
                      <span className="inline-block h-2 w-2 rounded-full bg-acc animate-pulse" />
                      Run Task ↵
                    </div>
                  </button>
                </div>
              )}

              {/* Task Execution (Thinking + Logs) */}
              {(simPhase === "executing_task" || simPhase === "completed") && (
                <div className="space-y-3 pt-1">
                  {/* Echoed Prompt */}
                  <div className="text-t1 font-semibold text-[13px] flex items-center gap-2">
                    <span className="text-acc">&gt;</span>
                    <span>{scenario.prompt}</span>
                  </div>

                  {/* Thinking Block */}
                  <div className="text-t3 italic text-[12px] flex items-center gap-2 py-0.5">
                    <span className="text-acc">▸</span>
                    {!isThinkingComplete ? (
                      <span>
                        Thought for {thoughtSec}s, {thoughtTokens >= 1000 ? `${(thoughtTokens / 1000).toFixed(1)}k` : thoughtTokens} tokens...
                      </span>
                    ) : (
                      <span>{scenario.thoughtSummary}</span>
                    )}
                  </div>

                  {/* Streamed Execution Logs */}
                  <div className="space-y-2 pt-1">
                    {scenario.agyLogStream.slice(0, streamedLogCount).map((log, i) => (
                      <div key={i} className="leading-relaxed">
                        {log.type === "read" && (
                          <span className="text-t1 block">
                            <span className="text-acc font-bold mr-1.5">●</span>
                            {cleanLogText(log.text)}
                          </span>
                        )}
                        {log.type === "edit" && (
                          <span className="text-t1 block">
                            <span className="text-acc font-bold mr-1.5">●</span>
                            {cleanLogText(log.text)}
                          </span>
                        )}
                        {log.type === "bash" && (
                          <span className="text-t1 block">
                            <span className="text-amber font-bold mr-1.5">●</span>
                            {cleanLogText(log.text)}
                          </span>
                        )}
                        {log.type === "error" && (
                          <span className="text-amber block font-semibold pl-4 whitespace-pre-wrap">
                            {cleanLogText(log.text)}
                          </span>
                        )}
                        {log.type === "output" && (
                          <span className="text-t2 block font-medium pl-4 pt-0.5 whitespace-pre-wrap">
                            {cleanLogText(log.text)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Terminal Prompt Input Bar */}
        <form
          onSubmit={handleTerminalInputSubmit}
          className="border-t border-border bg-surface/90 px-4 py-3 flex items-center gap-3"
        >
          <span className="text-acc font-mono text-[13px] font-bold shrink-0">
            {activeOutputPanel === "logs" ? "agy >" : "safebox $"}
          </span>
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            disabled={simPhase === "booting_trace" || simPhase === "signing_in"}
            placeholder={
              simPhase === "unselected"
                ? "Select a scenario above to start..."
                : simPhase === "ready_to_launch"
                ? "Click the launcher command above to boot sandbox..."
                : simPhase === "session_ready"
                ? "Click 'Run Task' above or press Execute..."
                : activeOutputPanel !== "logs"
                ? "Type 'logs' to return, or run 'safebox diff', 'diff -p', 'apply', 'revert'..."
                : "Type 'safebox diff', 'diff -p', 'apply', 'revert', or enter a command..."
            }
            className="flex-1 bg-transparent font-mono text-[13px] text-t1 placeholder:text-t3/60 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={simPhase === "booting_trace" || simPhase === "signing_in"}
            className="px-3.5 py-1.5 rounded bg-acc/10 border border-acc/30 text-acc font-mono text-[11px] font-semibold hover:bg-acc/20 transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {simPhase === "session_ready" ? "Run Task" : "Execute"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. Chrome DevTools Network Waterfall View
   ───────────────────────────────────────────────────────────────────────────── */
function WaterfallView() {
  const [selectedStepId, setSelectedStepId] = useState<string>(
    WATERFALL_STEPS[0].id
  );

  const selectedStep =
    WATERFALL_STEPS.find((s) => s.id === selectedStepId) || WATERFALL_STEPS[0];

  // Maximum benchmarked duration is 26.81ms (26812 microseconds)
  const MAX_MICROS = 26812;

  return (
    <div className="rounded-2xl border border-border bg-code-bg overflow-hidden shadow-2xl space-y-4 p-5 md:p-6">
      {/* DevTools Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <span className="text-amber font-mono text-[11px] font-bold uppercase tracking-wider">
            Kernel Initialization Trace
          </span>
          <h3 className="font-display text-[19px] font-bold text-t1 mt-0.5">
            Safebox Pre-Exec Waterfall (11 Lifecycle Phases)
          </h3>
          <p className="text-t3 text-[13px] font-mono mt-1">
            Total Supervisor Setup Latency: 24.8ms average cold start
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-t2">
            <span className="h-2 w-2 rounded-full bg-[#60A5FA]" />
            Supervisor (Parent)
          </span>
          <span className="flex items-center gap-1.5 text-t2">
            <span className="h-2 w-2 rounded-full bg-acc" />
            Child Shim (PID 1)
          </span>
          <span className="flex items-center gap-1.5 text-t2">
            <span className="h-2 w-2 rounded-full bg-amber" />
            Landlock LSM
          </span>
        </div>
      </div>

      {/* Waterfall Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[12px] border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border/80 text-t3 text-[10.5px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Phase Name</th>
              <th className="py-2.5 px-3">Context</th>
              <th className="py-2.5 px-3">Primary Syscall</th>
              <th className="py-2.5 px-2">Status</th>
              <th className="py-2.5 px-3 text-right">Duration</th>
              <th className="py-2.5 px-3 w-[260px]">Waterfall Timeline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {WATERFALL_STEPS.map((step) => {
              const isSelected = selectedStepId === step.id;
              // Compute percentage width with minimum 4% so microsecond items remain visible
              const rawPct = (step.durationMicros / MAX_MICROS) * 100;
              const barWidth = Math.max(4, Math.min(rawPct, 100));

              let barColor = "bg-[#60A5FA]";
              if (step.phase === "child") barColor = "bg-acc";
              if (step.id === "step-landlock-restrict") barColor = "bg-amber";

              return (
                <tr
                  key={step.id}
                  onClick={() => setSelectedStepId(step.id)}
                  className={cn(
                    "transition-colors cursor-pointer",
                    isSelected
                      ? "bg-surface/90 text-t1 font-medium"
                      : "hover:bg-surface/40 text-t2"
                  )}
                >
                  <td className="py-2.5 px-3 font-semibold">
                    <span className="text-acc mr-1.5">[ok]</span>
                    {step.name}
                  </td>
                  <td className="py-2.5 px-3 text-t3">
                    {step.phase === "supervisor" ? "Supervisor (P)" : "Child (PID 1)"}
                  </td>
                  <td className="py-2.5 px-3 text-t3 truncate max-w-[140px]">
                    {step.syscall}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-acc/10 text-acc border border-acc/20">
                      200 OK
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-t1 font-bold">
                    {step.durationLabel}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="w-full bg-bg/80 rounded-full h-2.5 overflow-hidden border border-border/40 flex items-center">
                      <div
                        style={{ width: `${barWidth}%` }}
                        className={cn("h-full rounded-full transition-all duration-300", barColor)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expandable Step Inspector Drawer */}
      <div className="rounded-xl border border-border bg-surface/60 p-4 md:p-5 space-y-3 font-mono text-[12px]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div>
            <span className="text-t3 text-[10px] uppercase tracking-wider">
              Selected Phase Details:
            </span>
            <h4 className="text-[16px] font-bold text-t1 mt-0.5">
              {selectedStep.name} ({selectedStep.durationLabel})
            </h4>
          </div>
          <span className="text-acc text-[11px] bg-acc/10 border border-acc/20 px-2 py-0.5 rounded">
            Context: {selectedStep.phase}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-t3 text-[10.5px] uppercase">Syscall Signature &amp; Flags</p>
            <p className="text-t1 font-bold mt-1">{selectedStep.syscall}</p>
            <p className="text-t2 text-[11.5px] mt-0.5 bg-bg/60 p-2 rounded border border-border/40">
              {selectedStep.flags}
            </p>
          </div>

          <div>
            <p className="text-t3 text-[10.5px] uppercase">Security Invariant Enforced</p>
            <p className="text-amber font-semibold mt-1">
              {selectedStep.securityInvariant}
            </p>
            <p className="text-t2 text-[11.5px] mt-1">
              {selectedStep.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. Boundary Attack Lab View
   ───────────────────────────────────────────────────────────────────────────── */
function AttackLabView() {
  const [selectedVectorId, setSelectedVectorId] = useState<string>(
    ATTACK_VECTORS[0].id
  );

  const vector =
    ATTACK_VECTORS.find((v) => v.id === selectedVectorId) || ATTACK_VECTORS[0];

  return (
    <div className="rounded-2xl border border-border bg-code-bg overflow-hidden shadow-2xl p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <span className="text-amber font-mono text-[11px] font-bold uppercase tracking-wider">
          Adversarial Verification Arena
        </span>
        <h3 className="font-display text-[19px] font-bold text-t1 mt-0.5">
          Side-by-Side Execution: Bare Host vs Safebox Sandbox
        </h3>
        <p className="text-t2 text-[13px] mt-1">
          Demonstrates how Safebox neutralizes hazardous commands without root daemons or virtual machines.
        </p>
      </div>

      {/* Vector Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ATTACK_VECTORS.map((v) => {
          const isSelected = selectedVectorId === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVectorId(v.id)}
              className={cn(
                "rounded-xl border p-3.5 text-left transition-all cursor-pointer font-mono",
                isSelected
                  ? "bg-surface border-acc shadow-md"
                  : "bg-surface/40 border-border hover:border-border-strong text-t3 hover:text-t2"
              )}
            >
              <span className="text-amber text-[10px] uppercase font-bold tracking-wider block">
                {v.category}
              </span>
              <span className="text-t1 font-display font-bold text-[13px] mt-1 block">
                {v.title}
              </span>
              <span className="text-t3 text-[10.5px] truncate block mt-1.5">
                {v.command}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tested Command Banner */}
      <div className="rounded-xl border border-border bg-surface/50 p-3.5 font-mono text-[12.5px] flex items-center gap-3">
        <span className="text-amber font-bold shrink-0">TESTED COMMAND:</span>
        <code className="text-t1 bg-bg/80 px-2.5 py-1 rounded border border-border/60 overflow-x-auto flex-1">
          {vector.command}
        </code>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-[12px]">
        {/* Left Column: Bare Host (Vulnerable) */}
        <div className="rounded-xl border border-red-900/50 bg-red-950/10 p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-red-900/40 pb-2 mb-3">
              <span className="text-red-400 font-bold uppercase text-[11px] tracking-wider">
                Bare Host (Unconfined)
              </span>
              <span className="rounded bg-red-900/30 border border-red-700/50 px-2 py-0.5 text-red-300 text-[10px] font-bold">
                {vector.bareHost.severity}
              </span>
            </div>

            <pre className="rounded-lg bg-black/60 border border-red-900/30 p-3 text-red-200 text-[11.5px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
              <code>{vector.bareHost.terminalOutput}</code>
            </pre>
          </div>

          <div className="pt-2 border-t border-red-900/30">
            <p className="text-red-400 text-[11px] font-bold">OUTCOME:</p>
            <p className="text-t2 text-[12px] mt-0.5">{vector.bareHost.outcome}</p>
          </div>
        </div>

        {/* Right Column: Inside Safebox (Contained) */}
        <div className="rounded-xl border border-acc/40 bg-acc/5 p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-acc/30 pb-2 mb-3">
              <span className="text-acc font-bold uppercase text-[11px] tracking-wider">
                Inside Safebox (Contained)
              </span>
              <span className="rounded bg-acc/15 border border-acc/30 px-2 py-0.5 text-acc text-[10px] font-bold">
                PROTECTED
              </span>
            </div>

            <pre className="rounded-lg bg-black/60 border border-acc/20 p-3 text-t1 text-[11.5px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
              <code>{vector.safebox.terminalOutput}</code>
            </pre>
          </div>

          <div className="pt-2 border-t border-acc/30">
            <p className="text-acc text-[11px] font-bold">
              ENFORCING PRIMITIVE:
            </p>
            <p className="text-t1 text-[12px] font-semibold mt-0.5">
              {vector.safebox.enforcingPrimitive}
            </p>
            <p className="text-t2 text-[11.5px] mt-0.5">{vector.safebox.outcome}</p>
          </div>
        </div>
      </div>

      {/* Technical Remediation & Kernel Post-Mortem */}
      <div className="rounded-xl border border-border bg-surface/40 p-4 font-mono text-[12px] space-y-1.5">
        <p className="text-amber font-bold text-[11px] uppercase tracking-wider">
          Kernel Subsystem Post-Mortem:
        </p>
        <p className="text-t2 text-[13px] leading-relaxed">
          {vector.technicalRemediation}
        </p>
      </div>
    </div>
  );
}
