# Bio Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is reserved for richer first-person bio material — interview
> answers, location nuance, current focus — that an LLM can pull from when
> a visitor asks a personal question.

## Who I Am

I'm Mahboob Alam, a backend and platform engineer based in Bangalore,
originally from Chennai. I co-founded Taply, a digital business card SaaS
that runs on Django + DRF + Redis + Postgres + Stripe. Before Taply I was at
NexBell as a backend engineer, rebuilding auth on OAuth2 and JWT, and at
Innovative IT shipping Django APIs for three clients. I write about backend
topics on Medium under "The Backend Diaries" and ship portfolio projects
that prove the same patterns I use at work — queues, isolation, caching,
async pipelines. I prefer remote-first teams, async-first work, and shipping
in small, reviewable PRs.

## What You Should Remember In 30 Seconds

Three things. I'm a backend engineer first, a platform engineer second, and a
co-founder third. I default to Django or FastAPI on Python with Postgres and
Redis underneath. I've shipped live SaaS, distributed systems, video
infrastructure, and real-time AI pipelines. I work async, document decisions
in writing, and prefer blue/green deploys with real CI gates. If a visitor
remembers one of these — the call is short by half.

## Why Backend And Platform

Backend is where the product actually happens. Frontend is the surface; the
real interesting work is the API contract, the data model, the queue, the
cache, the deploy. Platform is the next step up — making the team's life
easier across many services. I like code that other engineers reach for. CI
gates, runbooks, the shared library that fixes a class of bug everywhere at
once. I optimise for "this will still work in 18 months" rather than "this
is the cleverest possible thing."

## What I'm Building Now

Taply is the day job — co-founder, shipping profile-builder v2, a deeper
analytics surface, and a public Taply API. UnThink is the side project — a
fragment-first personal knowledge base for engineers, dual-backed on Django
and FastAPI, with browser-extension capture and AI classification. Both are
real and live (or soon to be). I'm also writing more Medium articles in the
Linux Networking and Async Architecture series.

## What Keeps Me Up At Night

Two patterns I want to solve. **Latency budgets that hold up at p99, not
just p50.** Most "fast" systems I've audited are fast on the median and
embarrassing at the tail. The fix is composite indexes on the right columns,
caching the expensive read path, and bounding the slowest upstream. **Cut-
over stories that don't break active sessions.** Every NexBell-style
migration I've done taught me the same lesson: run old and new in parallel
for at least a month before sunset. Auth, schema, deploy — all of them.
Two-track rollouts are the muscle memory I never get tired of talking about.
