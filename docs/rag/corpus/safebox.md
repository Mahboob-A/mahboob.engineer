# Safebox Corpus Notes

> Technical deep-dive on Safebox for the dynamic RAG terminal assistant.
> This document details the threat model, kernel primitives, change management engine,
> benchmarks, and open-source implementation of Safebox.

## Overview And Problem Statement

Safebox is an unprivileged Linux sandbox and change management engine for autonomous AI coding agents, built in Go 1.24 and published as an open-source tool on GitHub at https://github.com/Mahboob-A/safebox.

Autonomous coding agents (such as Antigravity, Claude Code, or Aider) operate by generating bash commands from statistical token prediction. When given broad terminal access on a developer's machine, an agent can accidentally trigger catastrophic file deletions (such as rm -rf or expanding an unset variable to root), read private credentials from ~/.ssh or ~/.aws, or exfiltrate proprietary source code across unrestricted outbound network sockets.

Standard isolation solutions fall short for local development loops:
1. Docker introduces 300ms to 1500ms cold-start latency per invocation, requires a root background daemon or complex subuid configurations, and volume mounts write directly to host disks without instant rollback.
2. MicroVMs like Firecracker impose over 2000ms boot times and heavy resource overhead.

Safebox solves this by enforcing execution boundaries directly at the Linux system call layer in userspace. It requires zero root privileges, zero background daemons, and zero virtual machines. It delivers cold starts under 30 milliseconds (averaging 24.8 milliseconds), traps all file modifications in ephemeral memory, and enables instant zero-cost rollback.

## Rootless Architecture: 5 Kernel Layers

Safebox orchestrates five Linux kernel subsystems to build defense-in-depth around untrusted processes:

### 1. User Namespaces (CLONE_NEWUSER)
Safebox uses unprivileged user namespaces to unshare user and group IDs without requiring root. It writes a single-identity UID/GID mapping into /proc/self/uid_map and /proc/self/gid_map, mapping the caller's active host UID and GID to container root UID 0. An agent running whoami inside the container sees root, but the kernel denies any host-level administrative capabilities. Combined with mount (CLONE_NEWNS), PID (CLONE_NEWPID), network (CLONE_NEWNET), IPC (CLONE_NEWIPC), and UTS (CLONE_NEWUTS) namespaces, Safebox fully encapsulates the execution context.

### 2. In-Kernel Landlock LSM ABI v3
Safebox leverages the Landlock Linux Security Module (ABI v3) to enforce path-based Mandatory Access Control (MAC) in userspace. It configures default-deny path rules, explicitly whitelisting system shared libraries (/usr/lib, /lib64) and SSL certificates (/etc/ssl/certs) in read-only mode, while restricting write operations strictly to the active workspace directory. Every invocation applies PR_SET_NO_NEW_PRIVS=1, locking the process so child executions cannot escalate privileges through SUID binaries.

### 3. Ephemeral Workspace Scratchpad (OverlayFS userxattr)
Rather than copying entire repositories, Safebox mounts an unprivileged OverlayFS union over the current working directory using the userxattr mount option. The host workspace acts as an immutable, read-only lowerdir. All write operations, file creations, and compilations are directed into an ephemeral upperdir and workdir in /tmp. Reads pass through at native NVMe speeds. When an agent deletes a file, OverlayFS creates a whiteout character device in upperdir without touching the host disk. Safebox implements SafeRemoveAll to reset restrictive work/work directory modes (0000) to 0700 on unmount, preventing permission traps.

### 4. Userspace NAT Network Confinement (CLONE_NEWNET)
Safebox isolates the network stack by default. For agents requiring web access, it connects an unprivileged userspace NAT backend (auto-detecting pasta, falling back to slirp4netns, or initializing a pure-Go TAP forwarder). It synchronizes child execution with a --ready-fd barrier to eliminate race conditions before the virtual interface is up. Inside the container, a synthetic /etc/resolv.conf points to a virtual gateway (10.0.2.3). To eliminate DNS rebinding attacks, Safebox implements Layer 3 Domain IP Pinning (PinnedIPSet), resolving allowed hostnames on startup and dropping packets to any other destination. Host loopback (127.0.0.1) and cloud metadata services (169.254.169.254) are physically unreachable.

### 5. In-Process PID 1 Init Supervisor (RunShim)
Linux PID 1 ignores default termination signals unless handled explicitly. Safebox embeds a custom Go supervisor shim at container PID 1. It multiplexes incoming terminal signals (SIGINT, SIGTERM, SIGHUP) directly to the agent payload running at PID 2 and executes a continuous wait4 loop to reap orphaned child processes, completely preventing zombie process accumulation from background forks.

## Change Management Engine

Safebox treats all workspace mutations as staged reviewable state:
- `safebox run`: Spawns the sandboxed command inside the ephemeral OverlayFS container.
- `safebox diff`: Inspects the upperdir scratchpad to display added, modified, and deleted files without modifying git status.
- `safebox diff -p`: Emits unified patch diffs of all staged modifications.
- `safebox apply`: Executes a two-phase atomic swap, committing upperdir mutations to the host workspace and purging ephemeral scratchpads.
- `safebox revert`: Instantly unlinks the ephemeral upperdir and workdir in under 1 millisecond, restoring the host workspace to its pristine state.

## Performance Benchmarks

Across 1000 consecutive benchmark executions on modern Linux systems:
- Average cold start: 24.8 milliseconds (consistently under 30 milliseconds).
- Performance advantage: 15x to 40x faster than Docker container startup; 100x faster than microVMs like Firecracker.
- Resource footprint: 0 root privileges required, 0 background daemons running, and 0 bytes of residual disk sprawl after revert.

## Go Systems Programming Context

Safebox is written in Go 1.24, relying strictly on standard library packages (syscall, os/exec, net) to interact directly with Linux kernel interfaces.

While my primary and strongest production language is Python (used across UnThink, Taply, Algocode, and Movio), I built Safebox to deepen my systems programming capabilities in Go. I rate my Go depth honestly at 55% learning on my tech stack page (/stack#go), and Safebox serves as my concrete, open-source demonstration of mastering low-level concurrency, process management, and kernel syscall orchestration in Go.

## Open Source Status And GitHub Repository

Safebox is an open-source project released under the MIT license.
- GitHub repository: https://github.com/Mahboob-A/safebox
- Case study and live interactive simulation: /work/safebox
- Stack tags: Go 1.24, Linux Namespaces, Landlock LSM, OverlayFS, slirp4netns, pasta, cgroups v2, POSIX Signals, Open Source.

## Live Simulation Engine On Portfolio

The case study at /work/safebox features a comprehensive 3-mode interactive simulation engine:
1. **AGY Terminal Simulation Engine**: Interactive simulation of running Google's Antigravity CLI (agy) inside Safebox, with slow-mo kernel boot traces, animated sign-in spinner, authentic session banner, and live execution of feature, refactoring, and jailbreak prompt scenarios.
2. **11-Stage Startup Waterfall**: Microsecond-by-microsecond breakdown of supervisor and child syscall timings (clone3, uid_map, mount namespaces, Landlock restrict, exec handoff).
3. **Boundary Attack Lab**: Interactive security testing demonstrating how Safebox intercepts credential theft, fork bombs, network exfiltration, and root filesystem tampering.
