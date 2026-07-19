# Project Deep Cuts Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is reserved for technical deep-cuts the project registries only
> summarize — incidents, scaling constraints, what to rebuild differently.

## Incidents And Postmortems

I won't share private-client incidents, but the public-project stories are
honest. **Algocode** — a fork bomb in a sibling container took down a
single node once. The fix was cgroup CPU caps plus a hard wall-clock limit
that the watchdog actually enforced. Before that fix, "securely running
untrusted code" was theatre. **Movio** — the Celery single-worker segment
upload held an S3 connection open for too long and left the rest of the
worker pool idle. The fix was Celery `group` fanout across available
workers, segments uploaded in parallel. **NexBell** — the legacy session-
based login was vulnerable to fixation, and the role checks were scattered
across decorators. The fix was a single OAuth2/JWT layer behind a single
decorator, plus a one-month parallel run. None of these were recovered from
postmortems alone — each one had a measurable spike in latency, error rate,
or churn that pointed to the symptom.

## What I Would Rebuild Differently

Honest list, one per project I want to revisit. **Taply v1** — Postgres is
on the same box as Redis would have happened; I shipped ALB + read-replicas
before that mistake, but I'd start multi-AZ from day one now. **Algocode** —
skip MongoDB for results, use Postgres JSONB; one less service to operate.
**CuteTube** — the Celery canvas was one big flow; I'd split it into
separate queue workers by task class so a slow batch doesn't starve
realtime. **NexBell** — extract the auth layer into a separate service so
the next product team can reuse OAuth2/JWT without forking it; add a per-
tenant database split before the second store comes online.
**DataLineage Doctor** — add HMAC webhook signature verification, real
auth on the dashboard, and multi-tenant routing before the first paying
customer.

## Demo Readiness

Two projects are live and stable today. **Taply** is live (co-founder
shipped it; the public demo lives at gettaply.me/p/mehboob). **UnThink** is
in active development — capture, classify, file loop works end-to-end,
no public demo yet. The rest are **portfolio projects on GitHub**, with a
README and a demo video where available. Algocode (22 stars), Movio (13
stars), DrishtiAI (14 stars), DataLineage Doctor (25 stars, 11 forks),
ProStream, CuteTube, AirPass, ImgTwist, Load Balancer Lab, Pulumi AWS
Infra. None of those have a live SaaS — they're repos, demo videos, and
case studies. Two are **dormant but available**: ProStream (live-stream
sibling of Movio, the Agora + SSLCommerz payments story) and AirPass
(WebRTC P2P file transfer). If a recruiter asks which project to look at
first, the answer is **Taply** for live SaaS, **Algocode** for distributed
systems, **Movio** for video, **DrishtiAI** for real-time AI.
