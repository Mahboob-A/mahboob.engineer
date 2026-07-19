# Project Deep Cuts Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is reserved for technical deep-cuts the project registries only
> summarize — incidents, scaling constraints, what to rebuild differently.

Use this file to enrich the RAG terminal with technical stories that do not fit
inside the public project cards.

## Prompts To Fill

For each important project, add:

- The hardest technical decision.
- One bug or failure that changed the design.
- What you would rebuild differently.
- What metric or user behavior proved the system worked.
- Whether the project is live, private, repo-only, or video-only.

## Starter Notes

Taply proves live SaaS ownership: profile modeling, Redis-cached public reads,
Stripe billing, team management, analytics, and NFC/QR sharing.

Algocode proves distributed systems depth: RabbitMQ coordination, isolated
runtime containers, Linux namespaces, cgroups, seccomp, verdict handling, and
rate limiting.

Movio proves video infrastructure depth: FFmpeg workers, adaptive HLS/DASH
renditions, CDN delivery, DRM packaging, and async processing.

DrishtiAI proves real-time AI pipeline work: Django/FastAPI services, React
Native capture, WebRTC transport, OpenCV preprocessing, and multilingual output.
