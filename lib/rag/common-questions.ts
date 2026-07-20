/**
 * lib/rag/common-questions.ts
 *
 * Curated visitor questions + first-person answers for the dynamic
 * RAG terminal. Each entry is a retrieval target: the LLM grounded
 * on these chunks speaks in Mahboob's voice, with concrete project
 * and tool names, instead of a generic knowledge-base tone.
 *
 * Phase 43: expanded from 6 (Phase 33 + Phase 37) to 28 entries
 * across 8 visitor-intent groups. Each answer respects the voice
 * rules in docs/rag/corpus/voice.md — first person, ≤80 words, no
 * preamble, no buzzwords, at most two short bullets, no fabricated
 * numbers or dates.
 *
 * Group guide:
 *   1. Identity & profile         — who / where / same-as-X
 *   2. Hiring & roles             — company fit / consulting / Taply
 *   3. Technical depth            — language / production / distributed
 *   4. Projects                   — Taply / Algocode / standout
 *   5. Writing & learning         — Medium / series / growth
 *   6. DSA & practice             — yes / where to verify
 *   7. Process & work style       — async / PR review
 *   8. Contact & logistics        — fastest path / resume / handles
 *
 * Edits land after the next `pnpm rag:reindex` run.
 */

export interface CommonQuestion {
  /** Semantic title — used as the chunk title in retrieval output. */
  title: string;
  /** 2–4 visitor phrasings the LLM should match this chunk on. */
  questions: string[];
  /** ≤80 words, first person, grounded in `data/*.ts` and the corpus docs. */
  answer: string;
  /** Retrieval tag seeds — surfaced as chunk metadata for filtering. */
  tags: string[];
}

export const COMMON_QUESTIONS: ReadonlyArray<CommonQuestion> = [
  /* ─── Group 1 — Identity & profile ─────────────────────────────── */
  {
    title: "Who is Mahboob Alam",
    questions: [
      "Who is Mahboob Alam?",
      "Tell me about Mahboob.",
      "What's Mahboob's background?",
    ],
    answer:
      "I'm a backend and platform engineer based in Bangalore, originally from Kolkata. I co-founded Taply (live SaaS on Django 5.1 + DRF + Redis + Postgres + Stripe) and built portfolio projects that prove the same patterns I use at work — distributed systems, video pipelines, real-time AI. Async-first, document decisions in writing. Master's in CS at SRM, Poridhi backend specialization.",
    tags: ["identity", "bio", "background"],
  },
  {
    title: "Where is Mahboob based",
    questions: [
      "Where is Mahboob based?",
      "Where does Mahboob live?",
      "What's Mahboob's location?",
    ],
    answer:
      "Kolkata, currently in Bangalore. Open to remote-first roles globally; on-site in India is fine. I keep IST hours with overlap windows for US and EU teams — 1–6pm IST works for the Americas, evenings for Europe.",
    tags: ["location", "timezone", "remote"],
  },
  {
    title: "Is this the same Mahboob on LinkedIn",
    questions: [
      "Is this the same Mahboob on LinkedIn?",
      "Are you the same person as on Medium?",
      "Confirm this is the same Mahboob-A on GitHub?",
    ],
    answer:
      "Yes. LinkedIn is linkedin.com/in/i-mahboob-alam. GitHub is Mahboob-A. Medium is imehboob. Taply profile is gettaply.me/p/mehboob. All five links live on /lets-connect under 'Find me elsewhere'.",
    tags: ["identity", "social", "verification"],
  },
  {
    title: "What is Mahboob's current title",
    questions: [
      "What's Mahboob's current title?",
      "What does Mahboob do at Taply?",
      "Is Mahboob a founder?",
    ],
    answer:
      "Co-Founder and Backend Engineer at Taply. I own the Django 5.1 + DRF backend end to end — profile system, NFC/QR layer, real-time analytics, team console, Stripe billing. Before Taply I was a backend engineer at NexBell, leading PR review and infra work for a 9-person team.",
    tags: ["title", "taply", "founder"],
  },

  /* ─── Group 2 — Hiring & roles ─────────────────────────────────── */
  {
    title: "What kind of company is Mahboob looking for",
    questions: [
      "What kind of company is Mahboob looking for?",
      "What stage of company fits Mahboob best?",
      "Is Mahboob a startup person or a big-company person?",
    ],
    answer:
      "Series A through C — large enough for real systems problems, small enough that one engineer shapes architecture. Remote-first preferred. Backend or platform roles where product code meets infra. Async-first teams. I am not a fit for Java-only or mobile-only roles.",
    tags: ["hiring", "company fit", "stage"],
  },
  {
    title: "Can Mahboob consult on Django or FastAPI",
    questions: [
      "Can Mahboob consult on Django or FastAPI?",
      "Does Mahboob take consulting work?",
      "Will Mahboob do a system design review?",
    ],
    answer:
      "Case by case. Backend architecture reviews, system design, Django or FastAPI consulting, cut-over planning. Short engagements, async-first. Use the 'consulting' label on /lets-connect or email connect.mahboobalam@gmail.com directly.",
    tags: ["consulting", "django", "fastapi"],
  },
  {
    title: "Is Mahboob open to Taply partnerships",
    questions: [
      "Is Mahboob open to Taply partnerships?",
      "Does Mahboob do Taply white-label conversations?",
      "Can I partner with Taply?",
    ],
    answer:
      "Yes — Taply partnership and white-label conversations are welcome. Taply is live SaaS on Django 5.1 with NFC + QR sharing, Stripe billing across Free / Pro / Business / Enterprise tiers. Use the 'taply-collab' label on /lets-connect or email connect.mahboobalam@gmail.com.",
    tags: ["taply", "partnership", "white-label"],
  },

  /* ─── Group 3 — Technical depth ────────────────────────────────── */
  {
    title: "What is Mahboob's strongest language",
    questions: [
      "What's Mahboob's strongest language?",
      "Which language does Mahboob prefer?",
      "Does Mahboob know Python deeply?",
    ],
    answer:
      "Python. Primary language for every backend project on the portfolio — Taply, Algocode, Movio, DrishtiAI, UnThink. Comfortable reading Go for code review. Java and Kotlin show up in SRM coursework but aren't production languages for me today.",
    tags: ["stack", "python", "language"],
  },
  {
    title: "Has Mahboob shipped production SaaS",
    questions: [
      "Has Mahboob shipped production SaaS?",
      "Does Mahboob have live SaaS experience?",
      "Is Taply a real product?",
    ],
    answer:
      "Yes. Taply is live SaaS I co-founded — profile builder, NFC and QR sharing, real-time analytics, team console, Stripe billing across Free, Pro, Business, Enterprise tiers. Taply's first enterprise customer was a 250-rep sales org, closed through the team console.",
    tags: ["taply", "saas", "production"],
  },
  {
    title: "Has Mahboob built a distributed system",
    questions: [
      "Has Mahboob built a distributed system?",
      "What's Mahboob's distributed-systems work?",
      "Has Mahboob worked with queues and microservices?",
    ],
    answer:
      "Yes. Algocode is a distributed online judge for C++ — three independent services coordinated through RabbitMQ, with sibling Docker containers using Linux namespaces, cgroups, and seccomp for kernel-level isolation. Movio's transcoder pipeline is microservice-shaped too.",
    tags: ["distributed", "algocode", "microservices"],
  },
  {
    title: "Has Mahboob built video infrastructure",
    questions: [
      "Has Mahboob built video infrastructure?",
      "What's Mahboob's video pipeline experience?",
      "Does Mahboob know HLS or DASH?",
    ],
    answer:
      "Yes. Movio is a YouTube-scale VOD platform — HLS, DASH, DRM, CloudFront CDN delivery. Transcoder workers via Celery + FFmpeg, multi-bitrate output, manifest packaging. CuteTube is the monolith-first version of the same idea. ffmpeg's subtitle-injection limit is a known gap.",
    tags: ["video", "movio", "hls", "dash"],
  },
  {
    title: "What databases has Mahboob used in production",
    questions: [
      "What databases has Mahboob used in production?",
      "Does Mahboob know PostgreSQL deeply?",
      "Has Mahboob used Redis?",
    ],
    answer:
      "PostgreSQL primary — Taply, Algocode, UnThink, DrishtiAI, ImgTwist. Redis for cache and Celery broker. MySQL at NexBell (50+ stores on a shared schema). MongoDB at Algocode and Movio for document shapes. Comfortable with composite indexes and reading query plans.",
    tags: ["database", "postgresql", "redis"],
  },
  {
    title: "What is Mahboob's experience with message queues",
    questions: [
      "What's Mahboob's experience with message queues?",
      "Does Mahboob know RabbitMQ?",
      "Has Mahboob shipped async pipelines?",
    ],
    answer:
      "RabbitMQ is my primary async backbone — Algocode's three services, Movio's transcoder workers, DrishtiAI's CV pipeline. Kafka covered in Poridhi's specialization, not shipped in production yet. Celery for Django-side async; Redis pub/sub for fanout.",
    tags: ["queue", "rabbitmq", "kafka", "async"],
  },

  /* ─── Group 4 — Projects ───────────────────────────────────────── */
  {
    title: "What is Taply",
    questions: [
      "What is Taply?",
      "Taply in one sentence?",
      "Why did Mahboob build Taply?",
    ],
    answer:
      "Taply is the digital business card platform my co-founder and I ship — tap or scan a QR or NFC tag, the recipient lands on a live profile in under 100ms via Redis, with one-tap vCard save. Built on Django 5.1 + DRF + Stripe. NFC chips are NDEF-rewritable so the same card outlives a role change.",
    tags: ["taply", "saas", "nfc"],
  },
  {
    title: "What is Algocode",
    questions: [
      "What is Algocode?",
      "What's the online judge project?",
      "Why is Algocode interesting?",
    ],
    answer:
      "Algocode is a distributed online judge for C++ — three independent services (Auth, Code Manager, RCE Engine) coordinated through RabbitMQ. Kernel isolation through sibling Docker containers using Linux namespaces, cgroups, and seccomp. 22 stars on GitHub. The postmortem worth reading is the sibling fork-bomb incident.",
    tags: ["algocode", "distributed", "judge"],
  },
  {
    title: "Which project shows backend depth",
    questions: [
      "Which project shows backend depth?",
      "Where should a hiring manager start?",
      "Strongest backend project on the portfolio?",
    ],
    answer:
      "Algocode for distributed systems, Movio for video infra, Taply for live SaaS, DrishtiAI for real-time AI pipelines. If you only look at two, Taply and Algocode — they cover backend depth and platform thinking, with stack traces to the other work.",
    tags: ["projects", "hiring", "depth"],
  },
  {
    title: "Is UnThink a real product",
    questions: [
      "Is UnThink a real product?",
      "Is UnThink shipped?",
      "What does UnThink do?",
    ],
    answer:
      "UnThink is real and in active build. Fragment-first personal knowledge base for engineers — dual-backed on Django and FastAPI, browser extension as the primary capture interface, AI classification on every save. Targeting August 2026 release; v1 isn't public yet.",
    tags: ["unthink", "ai", "building"],
  },

  /* ─── Group 5 — Writing & learning ────────────────────────────── */
  {
    title: "Does Mahboob write about engineering",
    questions: [
      "Does Mahboob write about engineering?",
      "Where does Mahboob publish?",
      "Is Mahboob's Medium active?",
    ],
    answer:
      "Yes. Medium under 'The Backend Diaries' — imehboob.medium.com. The Linux Networking series covers namespaces, cgroups, seccomp, kernel primitives behind container runtimes. The Async Architecture series covers queue design and backpressure. New posts roughly monthly, grounded in portfolio projects.",
    tags: ["writing", "medium", "blog"],
  },
  {
    title: "What series does Mahboob publish on Medium",
    questions: [
      "What series does Mahboob publish on Medium?",
      "List the ongoing Medium series.",
      "Linux Networking series?",
    ],
    answer:
      "Two ongoing series. Linux Networking (4 parts so far) covers namespaces, virtual interfaces, the kernel primitives behind container runtimes. Async Architecture covers queue design, backpressure, idempotency. Both grounded in portfolio projects — Algocode, Movio, DrishtiAI.",
    tags: ["writing", "series", "linux-networking"],
  },
  {
    title: "What is Mahboob currently learning",
    questions: [
      "What is Mahboob currently learning?",
      "Where is Mahboob still growing?",
      "What's Mahboob's weakest production tech?",
    ],
    answer:
      "Go, Terraform, Kubernetes, eBPF. Listed on /stack as learning / growth areas with honest depth markers. Closest production-shaped exposure: Linux namespaces, cgroups, seccomp in Algocode. I'd learn fast on a Go service but I'm not a Go engineer today.",
    tags: ["learning", "growth", "boundaries"],
  },

  /* ─── Group 6 — DSA & practice ─────────────────────────────────── */
  {
    title: "Does Mahboob practice DSA",
    questions: [
      "Does Mahboob practice DSA?",
      "Does Mahboob do problem solving?",
      "Is Mahboob a competitive programmer?",
    ],
    answer:
      "Yes — actively. Five public profiles make the habit verifiable: Codolio aggregates total solved, LeetCode (mahboob-alam), Codeforces (yurious), Code360 (yurious), InterviewBit (mahboob-a). Profiles link from /log. Counts and ratings aren't published — verify on the platforms directly.",
    tags: ["dsa", "practice", "problem-solving"],
  },
  {
    title: "Where can I see Mahboob's coding profiles",
    questions: [
      "Where can I see Mahboob's coding profiles?",
      "List Mahboob's competitive programming accounts.",
      "Mahboob's LeetCode handle?",
    ],
    answer:
      "Codolio — codolio.com/profile/yurious (aggregator). LeetCode — leetcode.com/u/mahboob-alam. Codeforces — codeforces.com/profile/yurious. Code360 — naukri.com/code360/profile/yurious. InterviewBit — interviewbit.com/profile/mahboob-a. All five link from /log under 'Practice & DSA'.",
    tags: ["dsa", "profiles", "links"],
  },

  /* ─── Group 7 — Process & work style ───────────────────────────── */
  {
    title: "How does Mahboob work with teammates",
    questions: [
      "How does Mahboob work with teammates?",
      "Is Mahboob a team lead?",
      "How does Mahboob collaborate?",
    ],
    answer:
      "Async-first. Long-form PRs, written design notes, decision records. At NexBell I ran sprint planning and PR review for a 9-person team and pushed mandatory CI gates (lint, typecheck, tests) before review. Comfortable with overlapping-time-zone teams. Not a manager-track engineer.",
    tags: ["work-style", "team", "async"],
  },
  {
    title: "How does Mahboob review PRs",
    questions: [
      "How does Mahboob review PRs?",
      "PR review style?",
      "Does Mahboob gate CI?",
    ],
    answer:
      "Small enough to review in one sitting. CI gates first (lint, typecheck, tests, build). Then correctness, then tests-as-spec. Comments are written to be replied to in writing — no synchronous pairing required. Async-first everywhere; pair-review only when the design is ambiguous.",
    tags: ["pr", "review", "process"],
  },

  /* ─── Group 8 — Contact & logistics ────────────────────────────── */
  {
    title: "What is the fastest way to reach Mahboob",
    questions: [
      "What's the fastest way to reach Mahboob?",
      "Best way to contact Mahboob?",
      "How do I get a response quickly?",
    ],
    answer:
      "The /lets-connect form (Resend → my Gmail). Or email connect.mahboobalam@gmail.com directly. I read every message myself, response within a day or two. LinkedIn works for slower conversations; the form is fastest. Open-source issues live on GitHub.",
    tags: ["contact", "email", "lets-connect"],
  },
  {
    title: "Does Mahboob read every email",
    questions: [
      "Does Mahboob read every email?",
      "Who reads the contact form?",
      "Is the contact form private?",
    ],
    answer:
      "Yes. /lets-connect relays to my Gmail via Resend; nothing else touches the data. I don't subscribe visitors to anything and no AI model trains on the form contents. Response within a day or two. The 6-line privacy note on /lets-connect spells this out.",
    tags: ["privacy", "lets-connect", "resend"],
  },
  {
    title: "Where can I download Mahboob's resume",
    questions: [
      "Where can I download Mahboob's resume?",
      "Can I get a PDF resume?",
      "Where's the latest CV?",
    ],
    answer:
      "Google Drive link on /lets-connect under 'Find me elsewhere'. Always the latest version. PDF, one-page format. The portfolio pages carry the same information; the resume is a printable version. Updated when role or major project changes.",
    tags: ["resume", "cv", "lets-connect"],
  },
  {
    title: "What is Mahboob's GitHub username",
    questions: [
      "What's Mahboob's GitHub username?",
      "Where are Mahboob's public repos?",
      "List Mahboob's open-source projects.",
    ],
    answer:
      "@Mahboob-A. github.com/Mahboob-A. Public repos include Algocode, Movio, DrishtiAI, CuteTube, AirPass, Pulumi AWS infra (backend + client repos), DataLineage Doctor, ImgTwist, Load Balancer lab. Taply and UnThink repos are private; the portfolio pages are the public surface.",
    tags: ["github", "open-source", "repos"],
  },
];