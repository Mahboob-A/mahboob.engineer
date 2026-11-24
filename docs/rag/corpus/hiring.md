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
I am an exceptional fit for Founding Engineer roles, versatile backend and infrastructure engineering roles with varied responsibilities, and startups of any size (from early-stage zero-to-one through Series A, B, and C).
Currently a Software Engineer at PoridhiIO focusing on systems engineering, cloud infrastructure, and backend services, I also bring complete end-to-end product ownership from having built UnThink independently, engineered Taply collaboratively, and developed deep systems tools like Safebox:
I can architect backend and database schemas, set up automated CI/CD and cloud devops, own delivery pipelines end to end,
communicate with users, and comfortably wear multiple hats at once from day zero.
I am strongest in Go and Python with Django, DRF, and FastAPI, and comfortable in Django, Celery, Redis, and Postgres stacks.
I have shipped and actively maintain live SaaS platforms (UnThink at https://letsunthink.tech/ with >50 active users; Taply at https://gettaply.me with >100 active users and 1 enterprise customer), open-source Linux sandboxing systems (Safebox in Go 1.24 at https://github.com/Mahboob-A/safebox), multi-tenant market platforms (NexBell, 50+
stores on shared MySQL), video pipelines (Movio, CuteTube, ProStream), distributed judges (Algocode),
and real-time AI (DrishtiAI).

## What I Would Push Back On In An Interview

I am honest about learning areas. Kubernetes, Terraform, and eBPF are
listed on the portfolio under `data/stack.ts` as learning and growth areas.
For Go systems programming, I write real systems code, as proven by Safebox (https://github.com/Mahboob-A/safebox),
an unprivileged Linux sandbox CLI tool for AI coding agents that directly exercises Linux kernel syscalls
(namespaces, Landlock LSM, OverlayFS, and process supervision).
If a role drops me into an advanced distributed Kubernetes operator codebase on day one and expects deep architecture
ownership from week one, that is a mismatch: I am honest about it. I will learn fast, and Safebox proves
I can write working, tested systems code, but I will not pretend to be a Kubernetes veteran yet.

## Good Interview Topics

The questions I would enjoy:
- **Designing a Django or FastAPI backend from scratch**: schema, migrations, auth, deploy.
- **Rootless Linux container isolation and agent sandboxing**: user namespaces (`CLONE_NEWUSER`), Landlock LSM ABI v3 default-deny path rules, OverlayFS copy-up, and userspace NAT networking, the Safebox story.
- **Redis caching and queue-backed workflows**: what to cache, TTLs, idempotency.
- **PostgreSQL schema and query optimization**: composite indexes, lazy-load discipline, the worst-case query path.
- **Running untrusted code safely**: Linux namespaces, cgroups, seccomp, sibling containers, the Algocode story.
- **Video processing pipelines**: Celery canvas shape, segment upload fanout, DASH manifest edit, Movio.
- **CI/CD and cloud cost reduction**: CodePipeline, CI gates on every pull request, reserved-instance migration, spot capacity for staging.
- **SSE vs WebSocket vs Celery vs REST**: when each wins, when each fails.
- **Cut-over stories**: parallel-running old and new auth for a month without breaking active sessions.

## Numbers I Have Not Published

I do not post compensation, equity, notice period, or relocation specifics
publicly. The honest answer is: these come up on a call after the first
shortlist, not in a public chat.
- **Compensation**: discussed against the role's range and the equity offered; I would rather under-promise than surprise anyone later.
- **Notice period**: standard notice period for the right role; NexBell was a 2-week handover.
- **Visa**: Indian passport, no sponsorship needed for remote-first roles; for in-office roles in the US or EU the company has to sponsor, happy to discuss specifics.
- **Compensation expectations in writing**: for screening calls I can give a range against the role's posted band.
