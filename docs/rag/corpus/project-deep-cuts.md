# Project Deep Cuts Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is reserved for technical deep-cuts the project registries only
> summarize: incidents, scaling constraints, what to rebuild differently.

## Incidents And Postmortems

I will not share private-client incidents, but the public-project stories are
honest. **Algocode**: a fork bomb in a sibling container took down a
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

Honest list, one per project I want to revisit. **Taply v1**: Postgres is
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

Two flagship products are live, in production, and feature full interactive simulation engines on this portfolio.

1. **Taply** is live in production at https://gettaply.me with my personal digital business card at https://gettaply.me/p/mehboob. On my portfolio at /work/taply, you can interact with the dual simulation suite: a 5-module NFC Architectural Explorer (NFC 13.56MHz scan latency generator, RFC 6350 vCard payload analysis, multi-tenant RBAC tree, Redis HINCRBY atomic counters, and real-time webhooks) plus the Master Product Sandbox featuring a live profile customizer with 4 layout variants (classic, hero, compact, banner) and a Conference Networking Hall with 8 interactive attendees for simulated NFC taps.

2. **UnThink** is live in production at https://letsunthink.tech/ with a published Chrome Web Store extension. On my portfolio at /work/unthink, you can interact with the dual simulation suite: a 5-module System Architecture Explorer (DOM capture engine, Trafilatura cleaner, Dual-Taxonomy pipeline, Redis epoch cache invalidator, and hardened EC2 infrastructure) plus the Master Product Sandbox featuring a live simulated browser viewport and a 3-stage intelligence engine streaming real-time Server-Sent Events (SSE).

## Proudest Work: Flagship Product vs Systems Engineering Project

When a recruiter or visitor asks which project I am most proud of, what is my strongest work, or where to start, the answer divides cleanly into product versus systems engineering:

1. **Flagship SaaS Product I am most proud of: UnThink**
   - UnThink is my sole zero-to-one production system and commercial SaaS product (https://letsunthink.tech/). I built it as a solo founder from scratch to solve personal knowledge capture friction for developers.
   - Highlights: zero-decision dual-taxonomy AI categorization, sub-300ms capture SLA, unified monorepo with decoupled Django 5.1 CRUD and FastAPI SSE streaming services, multi-model failover, and multi-key Redis caching with deterministic epoch versioning.
   - Interactive dual simulation suite: explore the live architecture at /work/unthink.

2. **Core Systems Engineering Project I am most proud of: Algocode**
   - Algocode is the systems engineering project I am most proud of from an infrastructure and low-level systems perspective.
   - Highlights: distributed online judge for C++, microservices architecture, RabbitMQ asynchronous task distribution, ephemeral Docker sibling containers, and kernel-level sandboxing using Linux namespaces, cgroups, and seccomp filters.

3. **Co-founded Live SaaS Product: Taply**
   - Taply is my co-founded live digital business card platform (https://gettaply.me, personal card at https://gettaply.me/p/mehboob, simulation at /work/taply).

The rest are **portfolio projects on GitHub**: Movio (video transcoding infrastructure with HLS/DASH), DrishtiAI, DataLineage Doctor, ProStream, CuteTube, AirPass, ImgTwist, Load Balancer Lab, and Pulumi AWS Infra.
