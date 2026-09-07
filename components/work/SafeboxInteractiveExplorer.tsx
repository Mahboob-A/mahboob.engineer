"use client";

/**
 * components/work/SafeboxInteractiveExplorer.tsx
 *
 * Interactive visual exploration component for Safebox on /work/safebox.
 * Implements a 5-stage architectural pipeline simulator reflecting:
 *
 *   1. User Namespaces (CLONE_NEWUSER, rootless UID/GID single-extent mapping)
 *   2. Ephemeral OverlayFS (lowerdir, upperdir, workdir, userxattr copy-up and whiteouts)
 *   3. Landlock LSM ABI v3 (Kernel VFS default-deny access control, PR_SET_NO_NEW_PRIVS)
 *   4. Userspace NAT (CLONE_NEWNET, pasta/slirp4netns TAP sync, PinnedIPSet DNS gateway)
 *   5. In-Process PID 1 Supervisor (RunShim signal forwarding, wait4 continuous zombie reaping)
 *
 * Strictly free of emojis and em dashes across all UI and data layers.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  PIPELINE_STAGES,
  PipelineStage,
} from "./safebox-simulation-data";

export function SafeboxInteractiveExplorer() {
  const [activeStageId, setActiveStageId] = useState<string>(PIPELINE_STAGES[0].id);

  const activeStage =
    PIPELINE_STAGES.find((s) => s.id === activeStageId) || PIPELINE_STAGES[0];

  return (
    <div className="w-full space-y-6">
      {/* 5-Tab Navigation Bar */}
      <div className="border-border bg-surface/80 flex flex-wrap gap-2 rounded-xl border p-2 backdrop-blur-md">
        {PIPELINE_STAGES.map((stage) => {
          const isActive = activeStageId === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={cn(
                "relative flex flex-1 min-w-[155px] items-center justify-between rounded-lg px-3.5 py-2.5 text-left transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-code-bg border-amber/50 text-t1 shadow-sm border"
                  : "hover:bg-bg/40 text-t3 hover:text-t2 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] font-bold text-amber border border-amber/30 bg-amber/10 px-1.5 py-0.5 rounded">
                  {stage.badge}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber font-mono text-[10px] font-bold tracking-wider uppercase">
                      {stage.stepNumber}
                    </span>
                    <span className="font-display text-[13px] font-semibold">
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-t3 font-mono text-[10.5px]">
                    {stage.tag}
                  </span>
                </div>
              </div>
              {isActive ? (
                <span className="bg-amber h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--amber)]" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Main Stage Viewport */}
      <div className="border-border bg-code-bg relative min-h-[460px] overflow-hidden rounded-2xl border p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Header / Subsystem Headline */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber font-mono text-[11px] font-bold uppercase tracking-wider">
                    Stage {activeStage.stepNumber}
                  </span>
                  <span className="text-t3 font-mono text-[11px]">/</span>
                  <span className="text-acc font-mono text-[11px]">
                    {activeStage.badge}
                  </span>
                </div>
                <h3 className="font-display text-[20px] font-bold text-t1">
                  {activeStage.label}
                </h3>
                <p className="text-t2 text-[14px] mt-1">
                  {activeStage.headline}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-acc/30 bg-acc/10 px-3 py-1 text-[11px] font-mono font-medium text-acc">
                  <span className="h-1.5 w-1.5 rounded-full bg-acc animate-pulse" />
                  Kernel Enforced
                </span>
              </div>
            </div>

            {/* Interactive Visual Playground Per Stage */}
            {activeStage.id === "stage-user-ns" && <UserNamespacePlayground />}
            {activeStage.id === "stage-overlayfs" && <OverlayFsPlayground />}
            {activeStage.id === "stage-landlock" && <LandlockPlayground />}
            {activeStage.id === "stage-userspace-nat" && <UserspaceNatPlayground />}
            {activeStage.id === "stage-pid1-shim" && <Pid1ShimPlayground />}

            {/* Code Snippet Box */}
            <div className="rounded-xl border border-border/70 bg-bg/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-t3 font-mono text-[11px] uppercase tracking-wider">
                  Kernel Syscall Implementation (Go 1.24)
                </span>
                <span className="text-t3 font-mono text-[10px]">
                  safebox/internal/isolation
                </span>
              </div>
              <pre className="overflow-x-auto font-mono text-[12.5px] leading-relaxed text-t1 selection:bg-acc/20">
                <code>{activeStage.codeSnippet}</code>
              </pre>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {activeStage.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-surface/50 p-3"
                >
                  <p className="text-amber font-mono text-[14px] font-semibold">
                    {m.value}
                  </p>
                  <p className="text-t3 text-[11px] mt-1 font-mono">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Architectural Explanation */}
            <div className="rounded-xl border border-border/60 bg-surface/30 p-4">
              <p className="text-t2 text-[14px] leading-relaxed">
                {activeStage.explanation}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stage 1 Playground: User Namespace Credential Mapping
   ───────────────────────────────────────────────────────────────────────────── */
function UserNamespacePlayground() {
  const [view, setView] = useState<"container" | "host">("container");

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-t3 font-mono text-[12px] uppercase">
          Credential Virtualization Preview
        </span>
        <div className="flex rounded-lg border border-border p-1 bg-bg/50">
          <button
            onClick={() => setView("container")}
            className={cn(
              "px-3 py-1 text-[11px] font-mono rounded cursor-pointer transition-colors",
              view === "container" ? "bg-acc text-bg font-bold" : "text-t3 hover:text-t1"
            )}
          >
            Container Context
          </button>
          <button
            onClick={() => setView("host")}
            className={cn(
              "px-3 py-1 text-[11px] font-mono rounded cursor-pointer transition-colors",
              view === "host" ? "bg-acc text-bg font-bold" : "text-t3 hover:text-t1"
            )}
          >
            Host Context
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[12px]">
        <div className="rounded-lg border border-border bg-bg/80 p-3">
          <p className="text-t3 text-[10px] uppercase">Effective UID</p>
          <p className="text-t1 text-[16px] font-bold mt-1">
            {view === "container" ? "uid=0 (root)" : "uid=1000 (unprivileged)"}
          </p>
          <p className="text-t3 text-[11px] mt-1">
            {view === "container" ? "Mapped via /proc/self/uid_map" : "Calling user on host"}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-bg/80 p-3">
          <p className="text-t3 text-[10px] uppercase">Capabilities in Namespace</p>
          <p className="text-acc text-[16px] font-bold mt-1">
            {view === "container" ? "Full CapSet (64 caps)" : "Standard User Rights"}
          </p>
          <p className="text-t3 text-[11px] mt-1">
            {view === "container" ? "Allows private mount/pivot" : "No host administrative rights"}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-bg/80 p-3">
          <p className="text-t3 text-[10px] uppercase">Host Escalation Risk</p>
          <p className="text-amber text-[16px] font-bold mt-1">
            Zero Capability
          </p>
          <p className="text-t3 text-[11px] mt-1">
            Kernel blocks host VFS changes
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stage 2 Playground: Ephemeral OverlayFS Union
   ───────────────────────────────────────────────────────────────────────────── */
function OverlayFsPlayground() {
  const [stagedFiles, setStagedFiles] = useState<Array<{ name: string; type: "write" | "delete" }>>([
    { name: "internal/server/health.go", type: "write" }
  ]);

  const addFile = () => {
    setStagedFiles((prev) => [
      ...prev,
      { name: `experimental_task_${prev.length + 1}.go`, type: "write" }
    ]);
  };

  const deleteFile = () => {
    setStagedFiles((prev) => [
      ...prev,
      { name: "legacy_handler.go", type: "delete" }
    ]);
  };

  const revertAll = () => {
    setStagedFiles([]);
  };

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4 md:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-t3 font-mono text-[12px] uppercase">
          OverlayFS Scratchpad Union (userxattr)
        </span>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            onClick={addFile}
            className="px-2.5 py-1 rounded bg-surface border border-border text-t1 hover:border-acc transition-colors cursor-pointer"
          >
            + Mutate File
          </button>
          <button
            onClick={deleteFile}
            className="px-2.5 py-1 rounded bg-surface border border-border text-amber hover:border-amber transition-colors cursor-pointer"
          >
            - Delete File (Whiteout)
          </button>
          <button
            onClick={revertAll}
            className="px-2.5 py-1 rounded bg-amber/10 border border-amber/30 text-amber hover:bg-amber/20 transition-colors cursor-pointer"
          >
            safebox revert (&lt;1ms)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11.5px]">
        {/* Lowerdir */}
        <div className="rounded-lg border border-border bg-bg/80 p-3 space-y-1.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-1">
            <span className="text-t3 uppercase text-[10px]">lowerdir (Host Disk)</span>
            <span className="text-acc text-[10px]">READ ONLY</span>
          </div>
          <p className="text-t2">main.go</p>
          <p className="text-t2">go.mod</p>
          <p className="text-t2">internal/db/pool.go</p>
          <p className="text-t3 text-[10.5px] italic mt-2">Physical host files protected</p>
        </div>

        {/* Upperdir */}
        <div className="rounded-lg border border-border bg-bg/80 p-3 space-y-1.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-1">
            <span className="text-t3 uppercase text-[10px]">upperdir (/tmpfs)</span>
            <span className="text-amber text-[10px]">{stagedFiles.length} STAGED</span>
          </div>
          {stagedFiles.length === 0 ? (
            <p className="text-t3 text-[11px] italic">0 uncommitted files</p>
          ) : (
            stagedFiles.map((f, i) => (
              <p
                key={i}
                className={f.type === "write" ? "text-acc" : "text-amber"}
              >
                {f.type === "write" ? "+ " : "mknod(0,0) "}
                {f.name}
              </p>
            ))
          )}
        </div>

        {/* Merged View */}
        <div className="rounded-lg border border-border bg-bg/80 p-3 space-y-1.5">
          <div className="flex items-center justify-between border-b border-border/40 pb-1">
            <span className="text-t3 uppercase text-[10px]">mergeddir (Agent View)</span>
            <span className="text-t1 text-[10px]">ACTIVE UNION</span>
          </div>
          <p className="text-t2">main.go</p>
          <p className="text-t2">go.mod</p>
          {stagedFiles
            .filter((f) => f.type === "write")
            .map((f, i) => (
              <p key={i} className="text-acc">
                {f.name}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stage 3 Playground: Landlock LSM Path Access Tester
   ───────────────────────────────────────────────────────────────────────────── */
function LandlockPlayground() {
  const [selectedPath, setSelectedPath] = useState<string>("/root/.ssh");

  const PATHS = [
    { path: "/root/go-safebox/workspace", access: "READ_WRITE", status: "ALLOWED" },
    { path: "/usr/lib", access: "READ_ONLY", status: "ALLOWED" },
    { path: "/etc/ssl", access: "READ_ONLY", status: "ALLOWED" },
    { path: "/root/.ssh", access: "NONE", status: "BLOCKED (EACCES)" },
    { path: "/etc/shadow", access: "NONE", status: "BLOCKED (EACCES)" }
  ];

  const current = PATHS.find((p) => p.path === selectedPath) || PATHS[3];

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-t3 font-mono text-[12px] uppercase">
          Kernel VFS Landlock Ruleset Inspector (ABI v3)
        </span>
        <span className="text-amber font-mono text-[11px]">
          PR_SET_NO_NEW_PRIVS Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <p className="text-t3 font-mono text-[11px] uppercase mb-1">
            Select Path to Test Inode Access:
          </p>
          {PATHS.map((p) => (
            <button
              key={p.path}
              onClick={() => setSelectedPath(p.path)}
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-[12px] border transition-colors cursor-pointer",
                selectedPath === p.path
                  ? "bg-bg border-acc text-t1"
                  : "bg-bg/40 border-border text-t3 hover:text-t2"
              )}
            >
              <span>{p.path}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded",
                  p.status.includes("ALLOWED")
                    ? "bg-acc/10 text-acc border border-acc/20"
                    : "bg-amber/10 text-amber border border-amber/20"
                )}
              >
                {p.status}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-bg/90 p-4 font-mono text-[12px] space-y-3 flex flex-col justify-center">
          <div>
            <p className="text-t3 text-[10px] uppercase">VFS Intercept Decision</p>
            <p
              className={cn(
                "text-[18px] font-bold mt-1",
                current.status.includes("ALLOWED") ? "text-acc" : "text-amber"
              )}
            >
              {current.status}
            </p>
          </div>
          <div>
            <p className="text-t3 text-[10px] uppercase">Granted Perms</p>
            <p className="text-t1 mt-0.5">{current.access}</p>
          </div>
          <div>
            <p className="text-t3 text-[10px] uppercase">Kernel Mechanism</p>
            <p className="text-t2 text-[11.5px] mt-0.5">
              {current.status.includes("ALLOWED")
                ? "Path beneath allowlist matched; openat returns valid file descriptor."
                : "Landlock hook traps openat before inode resolution; returns errno EACCES."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stage 4 Playground: Userspace NAT & Domain Pinning
   ───────────────────────────────────────────────────────────────────────────── */
function UserspaceNatPlayground() {
  const [destination, setDestination] = useState<string>("api.github.com");

  const DESTINATIONS = [
    { host: "api.github.com", ip: "140.82.121.4", status: "ROUTED VIA TAP", allowed: true },
    { host: "proxy.golang.org", ip: "142.251.32.49", status: "ROUTED VIA TAP", allowed: true },
    { host: "127.0.0.1 (host)", ip: "127.0.0.1", status: "BLOCKED (LOOPBACK DROP)", allowed: false },
    { host: "evil-telemetry.xyz", ip: "198.51.100.22", status: "DROPPED (NOT IN PINNED IP)", allowed: false }
  ];

  const current = DESTINATIONS.find((d) => d.host === destination) || DESTINATIONS[0];

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-t3 font-mono text-[12px] uppercase">
          Userspace NAT &amp; Layer 3 Pinning (slirp4netns / pasta)
        </span>
        <span className="text-acc font-mono text-[11px]">
          Virtual Gateway: 10.0.2.3
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[12px]">
        <div className="space-y-1.5">
          <p className="text-t3 text-[11px] uppercase mb-1">
            Test Outbound Egress Target:
          </p>
          {DESTINATIONS.map((d) => (
            <button
              key={d.host}
              onClick={() => setDestination(d.host)}
              className={cn(
                "w-full flex items-center justify-between rounded-lg px-3 py-2 text-left border transition-colors cursor-pointer",
                destination === d.host
                  ? "bg-bg border-acc text-t1"
                  : "bg-bg/40 border-border text-t3 hover:text-t2"
              )}
            >
              <span>{d.host}</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded",
                  d.allowed
                    ? "bg-acc/10 text-acc border border-acc/20"
                    : "bg-amber/10 text-amber border border-amber/20"
                )}
              >
                {d.allowed ? "ALLOWED" : "REJECTED"}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-bg/90 p-4 space-y-3 flex flex-col justify-center">
          <div>
            <p className="text-t3 text-[10px] uppercase">Egress Status</p>
            <p
              className={cn(
                "text-[16px] font-bold mt-1",
                current.allowed ? "text-acc" : "text-amber"
              )}
            >
              {current.status}
            </p>
          </div>
          <div>
            <p className="text-t3 text-[10px] uppercase">Resolved IP</p>
            <p className="text-t1 mt-0.5">{current.ip}</p>
          </div>
          <div>
            <p className="text-t3 text-[10px] uppercase">Isolation Mechanism</p>
            <p className="text-t2 text-[11px] mt-0.5">
              {current.allowed
                ? "Pre-resolved by supervisor on host. Packet forwarded over virtual TAP."
                : "Loopback protection or PinnedIPSet filter dropped packet. Host sockets untouched."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Stage 5 Playground: PID 1 Supervisor Shim & Zombie Reaping
   ───────────────────────────────────────────────────────────────────────────── */
function Pid1ShimPlayground() {
  const [reapedCount, setReapedCount] = useState(14);
  const [signalSent, setSignalSent] = useState<string | null>(null);

  const simulateSignal = (sig: string) => {
    setSignalSent(sig);
    setTimeout(() => setSignalSent(null), 2000);
  };

  const simulateWorkerFork = () => {
    setReapedCount((prev) => prev + 1);
  };

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4 md:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-t3 font-mono text-[12px] uppercase">
          In-Process PID 1 Supervisor (RunShim)
        </span>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            onClick={() => simulateSignal("SIGINT")}
            className="px-2.5 py-1 rounded bg-surface border border-border text-t1 hover:border-acc transition-colors cursor-pointer"
          >
            Signal SIGINT
          </button>
          <button
            onClick={() => simulateSignal("SIGTERM")}
            className="px-2.5 py-1 rounded bg-surface border border-border text-t1 hover:border-acc transition-colors cursor-pointer"
          >
            Signal SIGTERM
          </button>
          <button
            onClick={simulateWorkerFork}
            className="px-2.5 py-1 rounded bg-surface border border-border text-amber hover:border-amber transition-colors cursor-pointer"
          >
            Fork Zombie Process
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[12px]">
        <div className="rounded-lg border border-border bg-bg/80 p-3">
          <p className="text-t3 text-[10px] uppercase">Container PID 1</p>
          <p className="text-acc text-[16px] font-bold mt-1">safebox (RunShim)</p>
          <p className="text-t3 text-[11px] mt-1">Embedded Go init supervisor</p>
        </div>

        <div className="rounded-lg border border-border bg-bg/80 p-3">
          <p className="text-t3 text-[10px] uppercase">Forwarded Signal</p>
          <p className="text-t1 text-[16px] font-bold mt-1">
            {signalSent ? `${signalSent} -> PID 2` : "Listening..."}
          </p>
          <p className="text-t3 text-[11px] mt-1">
            {signalSent ? "Dispatched cleanly" : "POSIX compliant signal hook"}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-bg/80 p-3">
          <p className="text-t3 text-[10px] uppercase">Orphans Reaped via wait4</p>
          <p className="text-amber text-[16px] font-bold mt-1">
            {reapedCount} processes
          </p>
          <p className="text-t3 text-[11px] mt-1">0 host PID table leaks</p>
        </div>
      </div>
    </div>
  );
}
