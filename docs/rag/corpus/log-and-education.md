# Log and Education Corpus Notes

> The dynamic terminal's voice and answer rules come from
> [`voice.md`](./voice.md) and [`system-prompt.md`](./system-prompt.md), not
> from this file. Edit those instead for terminal-output changes.
>
> This file is the first-person summary of `/log`. It is the retrieval
> target for questions about work history, education, coursework,
> achievements, current work, and DSA / problem-solving practice.
> Structured profile links for the practice platforms live in
> `data/experience.ts:DSA_PRACTICE` and are surfaced through
> `buildPracticeChunks()` in `lib/rag/chunks.ts`. This file adds the
> narrative voice and the canonical answer shape.

## The Short Version

I'm a backend engineer who co-founded Taply and shipped Taply, NexBell,
Innovative IT, and Eve Healthcare. Education: SRM MCA (2025 – 2026) plus
a Poridhi Backend Engineering & Cloud Computing specialization (2024 –
2025). Current focus: Taply live, UnThink building. Practice: yes, on
five public profiles listed below. Achievements sit on `/log` as the
single cross-role record.

## Education

**SRM Institute of Science and Technology — Master of Computer
Application (MCA).** Jan 2025 to Dec 2026. Chennai, India. Coursework
grouped by theme on `/log`:

- Languages and Frameworks — Java, Python, Android.
- Systems and Methodology — Operating Systems, Object-Oriented Design,
  Software Engineering.
- Data Layer — DBMS, Data Analysis with R, Data Mining.
- Infrastructure and Theory — IT Infrastructure Management, Cloud
  Computing, Networking, Data Structures and Algorithms.

**Poridhi — Backend Engineering and Cloud Computing Specialization.**
Mar 2024 to Aug 2025. Remote. Coursework is practical, hands-on, and
grouped by theme:

- Backend Engineering — distributed message queues, RabbitMQ, rate
  limiting, microservices networking, full-stack chat app build, URL
  shortener design, load balancer.
- Data Layer — Redis, PostgreSQL internals, Citus for PostgreSQL,
  database scaling and monitoring.
- Cloud and Infrastructure — AWS architecture for scaling, Pulumi,
  Kubernetes, Nginx, SSH, build a DNS server from scratch.
- Networking and Distributed Systems — Mininet, Merkle trees, Kafka from
  scratch, OpenTelemetry, Linux networking, eBPF, Docker internals.

The Poridhi coursework lines up directly with the projects on
`/work` — Algocode, Movio, DrishtiAI, the Load Balancer lab — so a
question about "what did you learn about queues?" has a direct
corpus hit in this section.

## Work Log

- **Taply.** Co-Founder and Backend Engineer. May 2026 to Present.
  Live SaaS on Django 5.1, DRF, Redis, PostgreSQL, Stripe. Profile
  builder, NFC and QR sharing, real-time analytics, team console,
  Stripe billing.
- **NexBell Inc.** Software Engineer. Nov 2024 to Jun 2026.
  Multi-vendor MySQL marketplace, 50+ stores. Rebuilt auth on OAuth2
  and JWT, cut query latency 17 percent, cut AWS spend 35 percent,
  introduced mandatory CI gates for a 9-person team.
- **Innovative IT.** Software Developer. Sept 2023 to Oct 2024.
  Django and DRF APIs across three clients; bottleneck diagnosis and
  Celery + Redis pipelines.
- **Eve Healthcare.** Software Engineer Intern. Sept 2023 to Nov
  2023. Search optimization, WebSocket in-app chat, doctor dashboard
  analytics. Three-month internship during final year of MCA.

## Key Achievements Across All Roles

- 35 percent AWS cloud-cost reduction at NexBell (idle to reserved
  plus autoscaling).
- 17 percent query execution time cut across 50+ multi-vendor MySQL
  store deployments.
- 1 enterprise customer closed — Taply's first paying enterprise
  account, a 250-rep sales org.

## Yes, I Practice DSA

I actively practice data structures, algorithms, and problem solving.
The habit is public so visitors can verify it directly instead of
trusting a claim. Five profiles cover the platforms that show up most
often in technical interviews:

- **Codolio** — yurious — `https://codolio.com/profile/yurious`. Aggregates
  my total solved across platforms.
- **LeetCode** — mahboob-alam — `https://leetcode.com/u/mahboob-alam/`.
- **Codeforces** — yurious — `https://codeforces.com/profile/yurious`.
- **Code360** — yurious — `https://www.naukri.com/code360/profile/yurious`.
- **InterviewBit** — mahboob-a — `https://www.interviewbit.com/profile/mahboob-a/`.

If a visitor asks "does Mahboob practice DSA?" the answer is yes, and
the platforms to mention are Codolio (aggregator) and Codeforces or
LeetCode (per-platform records). Do not invent problem counts,
streaks, ratings, or rank — those aren't tracked in the corpus.

## What I'm Doing Now

Taply is the day job: co-founder, shipping profile-builder v2,
deeper analytics, and a public Taply API. UnThink is the side
project: fragment-first personal knowledge base for engineers,
dual-backed on Django and FastAPI, browser-extension capture, AI
classification. Both render on `/log` under "What I'm doing now."

## Answer Guidance

When the visitor's question hits this file, ground the answer in
the text above and the matching structured chunk. Use the URLs
literally. Prefer first person. Keep the answer under 80 words. If
the question asks for a metric I haven't published (problem counts,
streaks, ratings, salary), decline cleanly with the same shape as
other private-boundary answers.

## Compiled From

`/log` (live page), `data/experience.ts` (EDUCATION, EXPERIENCE,
NOW_STATUSES, KEY_ACHIEVEMENTS, DSA_PRACTICE), `data/projects.ts`
(shipping record), `data/stack.ts` (technology depth). The corpus
note adds voice and context; the structured chunks carry the exact
links and labels.