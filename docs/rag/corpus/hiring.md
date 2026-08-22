# Hiring Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is reserved for richer hiring-fit detail: interview topics,
> team-shape preferences, compensation nuance, that the LLM can pull from
> when a visitor asks a hiring question.

## Strong Fit

Founding Engineer, Backend, and DevOps engineering roles where product ownership meets infrastructure:
APIs, async workers, queues, caching, databases, deployment automation, and production debugging.
I am exceptionally well-suited for Founding Engineer roles as well as Series A through C growth startups.
As a founder who built UnThink from scratch and co-founded Taply, I bring strong end-to-end product ownership:
I can architect backend and database schemas, set up automated CI/CD and cloud devops, lead sprint planning and meetings,
communicate with users, and comfortably wear multiple hats at once from day zero. Series A through C is also a sweet spot
because systems are large enough to present challenging architectural scale while allowing strong engineering ownership.
I am strongest in Python with Django, DRF, and FastAPI, and comfortable in Django, Celery, Redis, and Postgres stacks.
I have shipped live SaaS (Taply at https://gettaply.me), multi-tenant market platforms (NexBell, 50+
stores on shared MySQL), video pipelines (Movio, CuteTube, ProStream), distributed judges (Algocode),
and real-time AI (UnThink at https://letsunthink.tech/, DrishtiAI).

## What I Would Push Back On In An Interview

I am honest about learning areas. Go, Terraform, Kubernetes, and eBPF are
listed on the portfolio under `data/stack.ts` as learning and growth areas.
Algocode uses Linux namespaces, cgroups, and seccomp in production-shaped
code, and that is the closest I have to "production Go-style infrastructure
work" today. If a role drops me into a Go service on day one and expects
ownership from week one, that is a mismatch: I am honest about it. I will still
learn fast, but I will not pretend to be already there.

## Good Interview Topics

The questions I would enjoy:
- **Designing a Django or FastAPI backend from scratch**: schema, migrations, auth, deploy.
- **Redis caching and queue-backed workflows**: what to cache, TTLs, idempotency.
- **PostgreSQL schema and query optimization**: composite indexes, lazy-load discipline, the worst-case query path.
- **Running untrusted code safely**: Linux namespaces, cgroups, seccomp, sibling containers, the Algocode story.
- **Video processing pipelines**: Celery canvas shape, segment upload fanout, DASH manifest edit, Movio.
- **CI/CD and cloud cost reduction**: CodePipeline, blue/green on ALB, reserved-instance migration.
- **SSE vs WebSocket vs Celery vs REST**: when each wins, when each fails.
- **Cut-over stories**: parallel-running old and new auth for a month without breaking active sessions.

## Numbers I Have Not Published

I do not post compensation, equity, notice period, or relocation specifics
publicly. The honest answer is: these come up on a call after the first
shortlist, not in a public chat.
- **Compensation**: discussed against the role's range and the equity offered; I would rather under-promise than surprise anyone later.
- **Notice period**: two weeks for the right role, faster for a Taply partnership conversation; NexBell was a 2-week handover.
- **Visa**: Indian passport, no sponsorship needed for remote-first roles; for in-office roles in the US or EU the company has to sponsor, happy to discuss specifics.
- **Compensation expectations in writing**: for screening calls I can give a range against the role's posted band.
