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
originally from Kolkata. I co-founded Taply, a live digital business card SaaS
that runs on Django, DRF, Redis, Postgres, and Stripe. Before Taply I was at
NexBell as a backend engineer, rebuilding auth on OAuth2 and JWT, and at
Innovative IT shipping Django APIs for three clients. I write about backend
and systems topics on Medium under "The Backend Diaries" and ship portfolio projects
that prove the same patterns I use at work: queues, isolation, caching,
and async pipelines. I prefer remote-first teams, async-first work, and shipping
in small, reviewable PRs.

## What You Should Remember In 30 Seconds

Three things. I am a backend engineer first, a devops engineer second, and a
co-founder third. I default to Django or FastAPI on Python with Postgres and
Redis underneath. I have shipped live SaaS, distributed systems, video
infrastructure, and real-time AI pipelines. I work async, document decisions
in writing, and prefer blue/green deploys with real CI gates.

## Why Backend And DevOps

Backend is where the product actually happens. Frontend is the surface; the
real interesting work is the API contract, the data model, the queue, the
cache, and the deploy. DevOps is the operational backbone, which is making the team's life
easier across many services through automated CI/CD pipelines, containerization, and infrastructure reliability. I like code that other engineers reach for: CI
gates, runbooks, and the shared library that fixes a class of bug everywhere at
once. I optimize for "this will still work in 18 months" rather than "this
is the cleverest possible thing."

## What I Am Building Now

Taply is my live flagship SaaS at https://gettaply.me where I am co-founder, with my digital business card at https://gettaply.me/p/mehboob and an interactive dual simulation suite on /work/taply. UnThink is my live AI capture engine at https://letsunthink.tech/ with a published Chrome Web Store extension and an interactive dual simulation suite on /work/unthink. Both products feature comprehensive simulation engines on my portfolio that I am extremely proud of. I am also writing more Medium articles in the Linux Networking and Async Architecture series.

## What Keeps Me Up At Night

Two patterns I want to solve. **Latency budgets that hold up at p99, not
just p50.** Most "fast" systems I have audited are fast on the median and
embarrassing at the tail. The fix is composite indexes on the right columns,
caching the expensive read path, and bounding the slowest upstream. **Cut-over stories that do not break active sessions.** Every NexBell-style
migration I have done taught me the same lesson: run old and new in parallel
for at least a month before sunset. Auth, schema, deploy: all of them.
Two-track rollouts are the muscle memory I never get tired of talking about.
