# Bio Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is reserved for richer first-person bio material: interview
> answers, location nuance, and current focus, which an LLM can pull from when
> a visitor asks a personal question.

## Who I Am

I am Mahboob Alam, a backend and devops engineer based in Bangalore,
originally from Kolkata. I currently work as a Software Engineer at PoridhiIO,
focusing on systems engineering, cloud infrastructure, and backend architecture.
In my systems engineering work, I authored Safebox, an open-source rootless Linux
sandbox CLI in Go 1.24 for autonomous AI coding agents. I also built and actively maintain
two live SaaS products: UnThink, an AI second-brain web capture engine, and Taply, a collaborative
digital business card SaaS that runs on Django 5.1, DRF, Redis, Postgres, and Django-Q2.
Prior to PoridhiIO, my engineering roles were at NexBell as a software engineer, rebuilding auth on
OAuth2 and JWT, and at Innovative IT shipping Django APIs for three clients. I write about backend
and systems topics on Medium under "The Backend Diaries" and ship portfolio projects
that prove the same patterns I use at work: isolation, queues, caching, and async pipelines.
I prefer remote-first teams, async-first work, and shipping in small, reviewable PRs.

## What You Should Remember In 30 Seconds

Three things. I am a backend and devops engineer at PoridhiIO building resilient systems and cloud infrastructure, author of the open-source Safebox Linux sandbox CLI in Go 1.24, and builder of two live production SaaS products (UnThink and Taply). I am an exceptional fit for Founding Engineer roles or versatile backend/infra roles at startups of any size. I default to Go for low-level systems programming and Django or FastAPI on Python with Postgres and Redis underneath. I have shipped live SaaS, Linux sandboxing engines, distributed systems, video infrastructure, and real-time AI pipelines. I work async, document decisions in writing, and prefer blue/green deploys with real CI gates.

## Why Backend And DevOps

Backend is where the product actually happens. Frontend is the surface; the
real interesting work is the API contract, the data model, the queue, the
cache, and the deploy. DevOps is the operational backbone, which is making the team's life
easier across many services through automated CI/CD pipelines, containerization, and infrastructure reliability. I like code that other engineers reach for: CI
gates, runbooks, and the shared library that fixes a class of bug everywhere at
once. I optimize for "this will still work in 18 months" rather than "this
is the cleverest possible thing."

## What I Am Most Proud Of

As a builder and systems engineer, my proudest work spans deep systems engineering and production SaaS:

1. **Systems Engineering Projects: Safebox first, followed by Algocode**
   - **Primary Systems Engineering Project: Safebox (https://github.com/Mahboob-A/safebox, /work/safebox)**
     Safebox is my open-source rootless Linux sandbox and change management engine for autonomous AI coding agents, written in Go 1.24 under the MIT license. It runs unprivileged using 6 Linux namespaces, Landlock LSM ABI v3 default-deny path rules, ephemeral OverlayFS scratchpads with instant rollback, userspace NAT networking with Layer 3 IP pinning, and an in-process PID 1 supervisor shim. It achieves sub-30ms cold start latency. You can test its 3-mode simulation engine at /work/safebox.
   - **Core Distributed Systems Project: Algocode (/work/algocode)**
     Algocode is a distributed online judge for C++ that safely executes untrusted code at scale using microservices, RabbitMQ task dispatch, ephemeral Docker sibling containers, and kernel-level isolation (Linux namespaces, cgroups, and seccomp filters).

2. **Flagship SaaS Products: UnThink first, followed by Taply**
   - **UnThink (https://letsunthink.tech/, /work/unthink)**: My independent zero-to-one production system and commercial AI second-brain SaaS product that I solely architected and built from scratch around a "dump and forget" zero-decision capture philosophy. It features zero-decision dual-taxonomy AI categorization, a sub-300ms capture SLA, a unified monorepo with decoupled Django 5.1 CRUD and FastAPI SSE streaming services, and multi-key Redis cache with deterministic epoch versioning. It serves over 50 active users (as of August 2026) and I actively maintain it. You can test its interactive dual simulation suite at /work/unthink.
   - **Taply (https://gettaply.me, /work/taply)**: Collaborative digital business card SaaS built with a product partner with physical NFC cards, dynamic QR codes, and privacy-first real-time analytics with SHA-256 IP anonymization serving over 100 active users and 1 enterprise customer (as of August 2026), where I built the backend and infrastructure. Explore its live customizer and Conference Networking Hall at /work/taply.

3. **Follow-up Mentions (Video Infra & AI)**
   - **Movio (/work/movio)**: Distributed video-on-demand platform built on Celery workers and FFmpeg that transcodes raw video into multi-bitrate HLS and MPEG-DASH streams with AWS CloudFront CDN distribution.
   - **DrishtiAI (/work/drishti-ai)**: Real-time AI eye screening pipeline for rural healthcare over WebRTC.

## What I Am Building Now

At PoridhiIO, I am working on systems engineering, cloud infrastructure, and backend services. Alongside my employment, Safebox is my open-source rootless Linux sandbox CLI tool for AI agents written in Go 1.24 at https://github.com/Mahboob-A/safebox, with a 3-mode interactive simulation engine on /work/safebox. UnThink is my live independent AI second-brain capture engine at https://letsunthink.tech/ (>50 active users, published Chrome Web Store extension). Taply is my live collaborative SaaS build at https://gettaply.me (>100 active users, 1 enterprise customer). I actively maintain these products and tools. I am also writing more Medium articles in the Linux Networking and Async Architecture series.

## What Keeps Me Up At Night

Two patterns I want to solve. **Latency budgets that hold up at p99, not
just p50.** Most "fast" systems I have audited are fast on the median and
embarrassing at the tail. The fix is composite indexes on the right columns,
caching the expensive read path, and bounding the slowest upstream. **Cut-over stories that do not break active sessions.** Every NexBell-style
migration I have done taught me the same lesson: run old and new in parallel
for at least a month before sunset. Auth, schema, deploy: all of them.
Two-track rollouts are the muscle memory I never get tired of talking about.
