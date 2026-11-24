# Project Deep Cuts Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is reserved for technical deep-cuts the project registries only
> summarize: incidents, scaling constraints, what to rebuild differently.

## Incidents And Postmortems

I will not share private-client incidents, but the public-project stories are
honest. **Safebox**: in rootless user namespaces, OverlayFS creates internal
work/work directories with mode 0000 on unmount. Standard `os.RemoveAll` calls
failed with `EACCES`, causing ephemeral session directory leaks. The fix was
`SafeRemoveAll`, which recursively resets restrictive directory permissions to
0700 before unlinking. Additionally, child container execution raced ahead before
userspace NAT interfaces came online; the fix was an inter-process synchronization
pipe using `--ready-fd`. **Algocode**: a fork bomb in a sibling container took down a
single node once. The fix was cgroup CPU caps plus a hard wall-clock limit
that the watchdog actually enforced. Before that fix, "securely running
untrusted code" was theatre. **Movio**: the Celery single-worker segment
upload held an S3 connection open for too long and left the rest of the
worker pool idle. The fix was Celery `group` fanout across available
workers, segments uploaded in parallel. **NexBell**: the legacy session-
based login was vulnerable to fixation, and the role checks were scattered
across decorators. The fix was a single OAuth2/JWT layer behind a single
decorator, plus a one-month parallel run. None of these were recovered from
postmortems alone; each one had a measurable spike in latency, error rate,
or churn that pointed to the symptom.

## What I Would Rebuild Differently

Honest list, one per project I want to revisit. **Safebox v1**: integrate
cgroups v2 memory controller (`memory.max`) from day one instead of relying
purely on user namespace limits, and embed eBPF LSM audit probes directly
for real-time syscall tracing. **Taply v1**: Postgres is
on the same box as Redis would have happened; I shipped ALB + read-replicas
before that mistake, but I would start multi-AZ from day one now. **Algocode**:
skip MongoDB for results, use Postgres JSONB; one less service to operate.
**CuteTube**: the Celery canvas was one big flow; I would split it into
separate queue workers by task class so a slow batch does not starve
realtime. **NexBell**: extract the auth layer into a separate service so
the next product team can reuse OAuth2/JWT without forking it; add a per-
tenant database split before the second store comes online.
**DataLineage Doctor**: add HMAC webhook signature verification, real
auth on the dashboard, and multi-tenant routing before the first paying
customer.

## Demo Readiness And Live Simulation Suites

Three projects feature full interactive simulation engines on this portfolio:

1. **Safebox** is an open-source sandbox CLI tool on GitHub at https://github.com/Mahboob-A/safebox. On my portfolio at /work/safebox, you can interact with the 3-mode simulation engine: an AGY Terminal Simulation Engine running Antigravity CLI with slow-mo execution traces and change management controls, an 11-stage Startup Waterfall breaking down microsecond syscalls, and a Boundary Attack Lab testing credential theft, fork bombs, network leaks, and host filesystem tampering.

2. **UnThink** is live in production at https://letsunthink.tech/ with over 50 active users (as of August 2026) and a published Chrome Web Store extension. On my portfolio at /work/unthink, you can interact with the dual simulation suite: a 5-module System Architecture Explorer (DOM capture engine, Trafilatura cleaner, Dual-Taxonomy pipeline, Redis epoch cache invalidator, and hardened EC2 infrastructure) plus the Master Product Sandbox featuring a live simulated browser viewport and a 3-stage intelligence engine streaming real-time Server-Sent Events (SSE).

3. **Taply** is live in production at https://gettaply.me with over 100 active users and 1 paying enterprise customer (as of August 2026), and my personal digital business card at https://gettaply.me/p/mehboob. On my portfolio at /work/taply, you can interact with the dual simulation suite: a 5-module NFC Architectural Explorer (NFC 13.56MHz scan latency generator, RFC 6350 vCard payload analysis, multi-tenant RBAC tree, Redis HINCRBY atomic counters, and real-time webhooks) plus the Master Product Sandbox featuring a live profile customizer with 4 layout variants (classic, hero, compact, banner) and a Conference Networking Hall with 8 interactive attendees for simulated NFC taps.

## Proudest Work: Systems Engineering vs Flagship Products

When a recruiter or visitor asks which project I am most proud of, what is my best work, my favorite project, or where to start, the answer divides into systems engineering versus flagship products:

1. **Systems Engineering Projects: Safebox first, followed by Algocode**
   - **Primary Systems Engineering Project: Safebox (https://github.com/Mahboob-A/safebox, /work/safebox)**
     Safebox is my premier open-source rootless Linux sandbox CLI tool written in Go 1.24 under the MIT license. It confines autonomous AI coding agents at the system call boundary without requiring root privileges, Docker daemons, or virtual machines. It achieves sub-30ms cold starts (averaging 24.8ms), unprivileged user namespaces (`CLONE_NEWUSER`), in-kernel Landlock LSM ABI v3 default-deny path restrictions, ephemeral OverlayFS scratchpads with instant rollback in under 1ms, and in-process PID 1 supervisor shim with continuous wait4 zombie reaping. Explore the 3-mode simulation suite at /work/safebox.
   - **Core Distributed Systems Project: Algocode (/work/algocode)**
     Algocode is the distributed systems engineering project I built to master untrusted code execution. It compiles and runs untrusted C++ code safely across microservices, RabbitMQ asynchronous task queues, ephemeral Docker sibling containers, and kernel-level sandboxing (Linux namespaces, cgroups, and seccomp filters).

2. **Flagship SaaS Products: UnThink first, followed by Taply**
   - **UnThink (https://letsunthink.tech/, /work/unthink)**: My independent zero-to-one production system and commercial AI second-brain SaaS product. I built it independently from scratch around a "dump and forget" zero-decision capture philosophy for developers.
     Highlights: zero-decision dual-taxonomy AI categorization, sub-300ms capture SLA, unified monorepo with decoupled Django 5.1 CRUD and FastAPI SSE streaming services, multi-model failover, and multi-key Redis caching with deterministic epoch versioning. Serves over 50 active users (as of August 2026) and I actively maintain it.
     Interactive dual simulation suite: explore the live architecture at /work/unthink.
   - **Taply (https://gettaply.me, /work/taply)**: Collaborative live digital business card platform built with a product partner, featuring physical NFC cards, dynamic QR codes, and privacy-first analytics serving over 100 active users and 1 enterprise customer (as of August 2026), where I built the backend and infrastructure. Actively maintained.

3. **Follow-up Mentions (Video Infra & AI)**:
   - **Movio (/work/movio)**: Video-on-demand platform transcoding multi-bitrate HLS and MPEG-DASH streams with Celery and FFmpeg.
   - **DrishtiAI (/work/drishti-ai)**: Real-time eye screening pipeline for rural healthcare over WebRTC.

The rest are **portfolio projects on GitHub**: DataLineage Doctor, ProStream, CuteTube, AirPass, ImgTwist, Load Balancer Lab, and Pulumi AWS Infra.
