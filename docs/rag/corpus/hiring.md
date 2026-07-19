# Hiring Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is reserved for richer hiring-fit detail — interview topics,
> team-shape preferences, compensation nuance — that the LLM can pull from
> when a visitor asks a hiring question.

## Strong Fit

Backend or platform roles where product ownership meets infrastructure:
APIs, async workers, queues, caching, databases, deployment automation, and
production debugging. The sweet spot is a Series A through C company —
large enough that real systems problems exist, small enough that one
engineer can shape the architecture. I'm strongest in Python with Django /
DRF / FastAPI, and comfortable in Django + Celery + Redis + Postgres stacks.
I've shipped live SaaS (Taply), multi-tenant market platforms (NexBell, 50+
stores on shared MySQL), video pipelines (Movio, CuteTube, ProStream),
distributed judges (Algocode), and real-time AI (DrishtiAI, UnThink).

## What I'd Push Back On In An Interview

I'm honest about learning areas. Go, Terraform, Kubernetes, and eBPF are
listed on the portfolio under `data/stack.ts` as learning / growth areas.
Algocode uses Linux namespaces, cgroups, and seccomp in production-shaped
code, and that's the closest I have to "production Go-style infrastructure
work" today. If a role drops me into a Go service on day one and expects
ownership from week one, that's a mismatch — I'm honest about it. I'll still
learn fast, but I won't pretend to be already there.

## Good Interview Topics

The questions I'd enjoy. **Designing a Django or FastAPI backend from
scratch** — schema, migrations, auth, deploy. **Redis caching and queue-
backed workflows** — what to cache, TTLs, idempotency. **PostgreSQL schema
and query optimization** — composite indexes, lazy-load discipline, the
worst-case query path. **Running untrusted code safely** — Linux namespaces,
cgroups, seccomp, sibling containers, the Algocode story. **Video
processing pipelines** — Celery canvas shape, segment upload fanout, DASH
manifest edit, Movio. **CI/CD and cloud cost reduction** — CodePipeline,
blue/green on ALB, reserved-instance migration. **SSE vs WebSocket vs
Celery vs REST** — when each wins, when each fails. **Cut-over stories** —
parallel-running old and new auth for a month without breaking active
sessions.

## Numbers I Haven't Published

I don't post compensation, equity, notice period, or relocation specifics
publicly. The honest answer is: these come up on a call after the first
shortlist, not in a public chat. **Compensation** — discussed against the
role's range and the equity offered; I'd rather under-promise than surprise
anyone later. **Notice period** — two weeks for the right role, faster for
a Taply partnership conversation; NexBell was a 2-week handover. **Visa** —
Indian passport, no sponsorship needed for remote-first roles; for in-office
roles in the US or EU the company has to sponsor, happy to discuss
specifics. **Compensation expectations in writing** — for screening calls I
can give a range against the role's posted band.
