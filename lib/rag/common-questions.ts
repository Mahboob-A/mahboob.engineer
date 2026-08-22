/**
 * lib/rag/common-questions.ts
 *
 * Curated visitor questions + first-person answers for the dynamic
 * RAG terminal. Each entry is a retrieval target: the LLM grounded
 * on these chunks speaks in Mahboob's voice, with concrete project
 * and tool names, instead of a generic knowledge-base tone.
 *
 * Updated to enforce natural first-person conversational tone,
 * Backend & DevOps Engineer title, proud promotion of UnThink & Taply
 * live simulation suites, direct links (https://gettaply.me,
 * https://gettaply.me/p/mehboob, https://letsunthink.tech/),
 * and strict zero-emoji and zero-em-dash compliance.
 *
 * Edits land after the next `pnpm rag:reindex` run.
 */

export interface CommonQuestion {
  /** Semantic title - used as the chunk title in retrieval output. */
  title: string;
  /** 2-4 visitor phrasings the LLM should match this chunk on. */
  questions: string[];
  /** 120-180 words, first person, grounded in `data/*.ts` and the corpus docs. */
  answer: string;
  /** Retrieval tag seeds - surfaced as chunk metadata for filtering. */
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
      "I am a backend and devops engineer based in Bangalore, originally from Kolkata. I co-founded Taply (https://gettaply.me), which is a live digital business card SaaS built using Django 5.1, Django Rest Framework, Redis, PostgreSQL, and Stripe, with my personal card at https://gettaply.me/p/mehboob and an interactive dual simulation suite on /work/taply. I also built UnThink (https://letsunthink.tech/), an AI-powered personal knowledge base with an interactive dual simulation suite on /work/unthink. My portfolio projects demonstrate the same production systems patterns I use in my work, including distributed online judges with sandboxed containers, video transcoding pipelines, and real-time vision systems. I hold a Master's degree in Computer Applications from SRM Institute of Science and Technology, and a cloud specialization from Poridhi.",
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
      "I am currently based in Kolkata, West Bengal, which is my hometown. However, I am actively open to relocating to other major technology hubs in India, such as Bangalore, Chennai, or the National Capital Region (NCR) for the right opportunities. I am also highly open to remote-first software engineering roles globally. To collaborate effectively with international teams, I maintain flexible working hours and establish overlap windows for teams based in the United States and Europe. Typically, a window of 1:00 PM to 6:00 PM Indian Standard Time works well to sync with teams in the Americas, while my evenings are convenient for syncing with colleagues in Europe.",
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
      "Yes, that is me! I am the same Mahboob Alam who is active on LinkedIn under the profile link linkedin.com/in/i-mahboob-alam. You can also find my public code repositories on GitHub under the username Mahboob-A, and read my technical articles on Medium under my handle imehboob. If you would like to see my digital business card, you can view my live profile on Taply at https://gettaply.me/p/mehboob. All of these direct links and verified social profiles are consolidated on my portfolio's contact page under the /lets-connect route. You can also download my latest printable resume directly from that page or send me an email to start a conversation.",
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
      "I am currently a Co-Founder and Backend and DevOps Engineer at Taply, which is a live digital business card platform accessible at https://gettaply.me. In this role, I architected and own the entire backend service built on Django 5.1 and Django Rest Framework. This includes the profile customizer with multiple layouts, NFC and QR code sharing systems, real-time analytics tracking, and Stripe subscription billing. Prior to co-founding Taply, I worked as a software engineer at NexBell. At NexBell, I led sprint planning and code reviews for a nine-person engineering team, redesigned composite database indexes to cut query times, and rebuilt the authentication flow using OAuth2 and JSON Web Tokens.",
    tags: ["title", "taply", "founder", "devops"],
  },
  {
    title: "Is Mahboob a capable engineer",
    questions: [
      "Is Mahboob a capable engineer?",
      "Are you a good engineer?",
      "Is Mahboob employable?",
      "Are you a good team player?",
    ],
    answer:
      "Yes! That is me, and I am a capable backend and devops engineer. I co-founded a live SaaS platform, Taply (https://gettaply.me), and built complex systems like UnThink (https://letsunthink.tech/) and Algocode, which is a distributed online judge with isolated execution environments. I design my systems with performance and reliability in mind, focusing on composite indexing, in-memory caching, and clean API boundaries. While I am confident in my core stack of Python, Django, FastAPI, Redis, Docker, and PostgreSQL, I also recognize my growth areas. I am currently exploring technologies like Go, Terraform, Kubernetes, and eBPF. I am a quick learner and plan to build several projects using these technologies to solidify my skills.",
    tags: ["identity", "capability", "employability", "teamwork"],
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
      "I am looking for Founding Engineer, Backend, or DevOps engineering roles at early to growth-stage startups, particularly founding roles and Series A through C stages. Early-stage startups and Series A-C are where I thrive most: I bring strong product ownership, can handle backend architecture and automated CI/CD devops, manage stakeholder meetings, and comfortably wear multiple hats from day zero. I prefer remote-first organizations that practice async-first communication, document technical designs in writing, and value clean code with automated test coverage. I am not looking for Java-only, frontend-only, or mobile-only roles today.",
    tags: ["hiring", "company fit", "stage", "founding-engineer"],
  },
  {
    title: "Is Mahboob open to Founding Engineer roles",
    questions: [
      "Are you open to founding engineer roles?",
      "Would you join as a founding engineer?",
      "Can you wear multiple hats as a founding engineer?",
      "Are you suitable for early-stage startups?",
    ],
    answer:
      "Yes, I am actively open to and exceptionally well-suited for Founding Engineer roles. As a founder who built UnThink from scratch and co-founded Taply, I bring strong end-to-end product ownership. I can architect the backend and database schemas, set up automated CI/CD and cloud infrastructure, lead stakeholder and customer meetings, and comfortably wear multiple hats simultaneously from day zero. I thrive in early-stage environments where engineering speed and system reliability drive real business growth.",
    tags: ["hiring", "founding-engineer", "roles", "startups", "product-ownership"],
  },
  {
    title: "Can Mahboob consult on Django or FastAPI",
    questions: [
      "Can Mahboob consult on Django or FastAPI?",
      "Does Mahboob take consulting work?",
      "Will Mahboob do a system design review?",
    ],
    answer:
      "Yes, I take on consulting engagements on a case-by-case basis alongside my work. I specialize in backend architecture reviews, REST API design, database query optimization, system design, and migration planning for Django or FastAPI applications. I prefer short-term, async-first engagements where I can analyze system bottlenecks, write clear design proposals, and plan zero-downtime database cut-overs. If you have a specific system performance issue or are planning a major backend refactor, you can reach out to me by filling out the contact form on the /lets-connect page with the 'consulting' label. Alternatively, you can email me directly at connect.mahboobalam@gmail.com to discuss how I can help your team.",
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
      "Yes, I am open to partnership and white-label conversations for Taply. Since Taply is a fully functional digital business card SaaS built on Django 5.1 with NFC and QR capabilities, a team management console, and Stripe billing at https://gettaply.me, it can be customized or white-labeled for enterprise clients. I built the team management console specifically to allow organizations to manage bulk rep profiles and enforce brand controls, which helped us secure our first paying enterprise customer. If you are looking to integrate digital business cards for a large team or explore collaborations, you can use the 'taply-collab' label on the /lets-connect contact form, or email me at connect.mahboobalam@gmail.com.",
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
      "My strongest and most preferred programming language is Python. I have used Python as the primary language for every major backend system on my portfolio, including Taply, UnThink, Algocode, DrishtiAI, and Movio. I am highly comfortable with Python's asynchronous features, database ORMs, and web frameworks like Django and FastAPI. Beyond Python, I can read and understand Go for code reviews, and I am currently learning it deeply to build high-performance microservices. I also have academic exposure to Java and Kotlin from my Master's coursework at SRM, but I do not write them in production today. I focus on writing clean, type-safe, and highly performant code for backend platforms.",
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
      "Yes, I have shipped live, production SaaS products. As co-founder of Taply (https://gettaply.me), I architected and built the entire backend platform using Django 5.1, Django Rest Framework, Redis, PostgreSQL, and Stripe. The platform supports live profile builders with 4 layout variants, NFC and QR card sharing, real-time analytics, and bulk user onboarding. Taply is currently active and serves paying customers. I also built UnThink (https://letsunthink.tech/), a live AI-powered knowledge base with a published Chrome Web Store extension. On my portfolio at /work/taply and /work/unthink, you can experience full interactive simulation suites that demonstrate these architectures live.",
    tags: ["taply", "unthink", "saas", "production"],
  },
  {
    title: "Has Mahboob built a distributed system",
    questions: [
      "Has Mahboob built a distributed system?",
      "What's Mahboob's distributed-systems work?",
      "Has Mahboob worked with queues and microservices?",
    ],
    answer:
      "Yes, I have designed and implemented distributed systems. My project Algocode is a distributed online judge built for C++ execution. It comprises three independently deployable microservices: an authentication service, a code submission manager, and a remote code execution engine. These services communicate asynchronously using RabbitMQ message queues to manage task dispatch. To safely execute untrusted user code at scale, the execution workers spawn ephemeral sibling Docker containers. They use Linux namespaces, cgroups, and seccomp filters to enforce strict memory, CPU, and network boundaries at the kernel level.",
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
      "Yes, I have built video infrastructure from scratch. My project Movio is a YouTube-scale video-on-demand platform. It utilizes a custom transcoding pipeline built with Celery workers and FFmpeg. The system accepts video uploads, transcodes them into multi-bitrate HLS and MPEG-DASH streams, packages them with DRM protection, and distributes them via AWS CloudFront CDN. This ensures adaptive-bitrate streaming across devices. I also built CuteTube, which was a monolith-first VOD project. CuteTube helped me understand the fundamentals of video file processing before I scaled the architecture into Movio's microservice-based design.",
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
      "I primarily use PostgreSQL as my default database. I have designed relational schemas, written composite indexes, and optimized complex queries for systems like Taply, UnThink, Algocode, and DrishtiAI. I also use Redis extensively for session storage, caching, atomic HINCRBY counters, and as a message broker for Celery queues. In my work at NexBell, I worked with large multi-vendor MySQL databases containing fifty active store databases. I rewrote ORM queries and optimized composite indexes to reduce average query times by seventeen percent. For non-relational data, I use MongoDB to store document-like structures in Algocode and Movio.",
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
      "I use RabbitMQ as my primary message broker for building reliable asynchronous pipelines. In my project Algocode, RabbitMQ coordinates tasks between the core manager and code execution workers. In Movio, it manages the queue of video transcoding jobs. In UnThink, I use Redis and Celery across 3 priority queues (ai_urgent, default, and bulk) to manage real-time AI classification and ingestion. I also have deep conceptual knowledge of Kafka from my cloud specialization at Poridhi. For lighter async tasks within Django, I use Celery, and I utilize Redis pub-sub for real-time web socket message broadcasting.",
    tags: ["queue", "rabbitmq", "celery", "async"],
  },

  /* ─── Group 4 — Projects & Simulation Suites ───────────────────── */
  {
    title: "Tell me about Taply",
    questions: [
      "Tell me about Taply",
      "What is Taply?",
      "How does Taply work?",
      "Why did Mahboob build Taply?",
    ],
    answer:
      "I co-founded and built Taply to solve the problem of paper business cards, which get discarded quickly and cannot be updated. Taply is a live digital business card platform at https://gettaply.me, with my personal card at https://gettaply.me/p/mehboob. Users can share their contact information, social links, and portfolios instantly by tapping an NFC card or scanning a QR code. The recipient's phone loads the profile in under 80ms from our Redis cache, allowing a one-tap vCard save to their contacts. I am extremely proud of our interactive simulation suite on /work/taply, where you can test our 5-module System Explorer and interact with 8 attendees in a Conference Networking Hall. I warmly encourage you to try it out!",
    tags: ["taply", "saas", "nfc", "simulation"],
  },
  {
    title: "Tell me about UnThink",
    questions: [
      "Tell me about UnThink",
      "What is UnThink?",
      "How does UnThink work?",
      "Is UnThink a real product?",
    ],
    answer:
      "UnThink is my live AI-powered, fragment-first personal knowledge base and web capture engine for developers, available at https://letsunthink.tech/ with a published Chrome Web Store extension. It eliminates manual tagging friction through zero-decision dual-taxonomy AI categorization, a sub-300ms capture SLA, and a unified monorepo with specialized API and AI streaming services (Django 5.1 CRUD and FastAPI SSE streaming). It features 3 Celery queues, multi-key Redis caching with deterministic epoch versioning, and hardened AWS EC2 deployment. On my portfolio at /work/unthink, you can interact with a live simulated browser viewport and 3-stage AI pipeline. I am very proud of this engineering and highly encourage you to test the simulation!",
    tags: ["unthink", "ai", "live", "simulation", "founder"],
  },
  {
    title: "What are the interactive simulations on your portfolio",
    questions: [
      "What are the interactive simulations on your work pages?",
      "Tell me about the simulation engines",
      "How do the simulations on /work work?",
      "What demos can I test on your portfolio?",
    ],
    answer:
      "I have engineered comprehensive dual-simulation suites for my flagship projects on this portfolio. On /work/unthink, you can test a 5-module System Architecture Explorer (DOM capture, Trafilatura cleaner, Dual-Taxonomy pipeline, Redis epoch cache invalidator, and EC2 security) and a Master Dual-AI Sandbox with simulated browser highlighting and live Server-Sent Events streaming. On /work/taply, you can explore a 5-module NFC Architectural Explorer and a Master Product Sandbox featuring a live profile customizer with 4 layout variants and an interactive Conference Networking Hall where you can tap 8 attendees to exchange NFC cards in real time. I am immensely proud of these interactive engines and invite you to explore both case studies!",
    tags: ["simulation", "demos", "taply", "unthink", "interactive"],
  },
  {
    title: "Which project is Mahboob most proud of",
    questions: [
      "Which project are you most proud of?",
      "What are you most proud of building?",
      "What is your favorite project?",
      "What's your best work?",
      "Which project represents your skills best?",
    ],
    answer:
      "The work I am most proud of divides into two core achievements: UnThink as my flagship SaaS product, and Algocode as my core systems engineering project. UnThink (https://letsunthink.tech/) is my sole zero-to-one production SaaS product, architected from scratch to solve developer capture friction with zero-decision dual-taxonomy AI categorization, a sub-300ms capture SLA, and decoupled Django 5.1 and FastAPI SSE streaming services. You can test its dual simulation suite at /work/unthink. Algocode is the systems engineering project I am most proud of from an infrastructure perspective. It is a distributed online judge that safely compiles and runs untrusted user C++ code using microservices, RabbitMQ task dispatch, and kernel isolation with Linux namespaces, cgroups, and seccomp filters. I am also proud of co-founding Taply (https://gettaply.me, /work/taply).",
    tags: ["proud", "favorite", "unthink", "algocode", "projects", "product"],
  },
  {
    title: "What is Algocode",
    questions: [
      "What is Algocode?",
      "What's the online judge project?",
      "Why is Algocode interesting?",
    ],
    answer:
      "I built Algocode to learn how to securely run untrusted user code at scale. It is a distributed online judge for C++ submissions. The architecture is split into microservices for authentication, submission management, and execution, all coordinated by RabbitMQ queues. To prevent security vulnerabilities or system resource exhaustion, the execution service runs each code submission in a sandbox. It uses ephemeral Docker containers and kernel-level features, including Linux namespaces, cgroups, and seccomp filters, to enforce strict memory, execution time, and CPU execution limits.",
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
      "I recommend starting with UnThink (https://letsunthink.tech/, case study at /work/unthink) and Algocode. UnThink is my flagship SaaS product built from scratch as a sole founder, showcasing decoupled Django 5.1 and FastAPI SSE streaming services, AI dual taxonomy, and sub-millisecond Redis epoch cache invalidation. Algocode demonstrates deep low-level systems engineering, running untrusted C++ code safely across microservices with RabbitMQ and Linux kernel isolation (namespaces, cgroups, and seccomp filters). If you want to see live multi-tenant SaaS with real-time analytics, Taply (https://gettaply.me, /work/taply) is also a strong showcase with an interactive simulation suite.",
    tags: ["projects", "hiring", "depth", "unthink", "algocode", "taply"],
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
      "Yes, I write technical articles on Medium under my publication 'The Backend Diaries', located at imehboob.medium.com. I write detailed posts to document the systems designs, optimizations, and lessons from my portfolio projects. For example, my Linux Networking series explains the namespaces, veth pairs, and routing tables that make container networking work. My Async Architecture series covers task queues, message brokers, and concurrency. I aim to publish articles regularly because writing helps me clarify my design decisions and share what I learn with other developers.",
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
      "I publish two ongoing technical series on my Medium blog. The first is the Linux Networking series, which explains the kernel concepts behind container networks. It covers virtual ethernet pairs, network namespaces, and network bridges. The second is the Async Architecture series, which covers message broker patterns, task queue management, backpressure, and handling failing jobs. I base these articles directly on the systems I implement in my portfolio projects, such as the container execution sandbox in Algocode or the transcoding pipeline in Movio.",
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
      "I am actively learning Go, Terraform, Kubernetes, and eBPF. These are listed on my tech stack page with honest depth ratings. While I am highly proficient with Python, Django, Docker, and DevOps automation, I want to expand my skills in infrastructure orchestration and systems programming. I have used Pulumi for infrastructure as code, and I am now learning Terraform. Similarly, I understand container sandboxing through my work with Linux namespaces in Algocode, and I am studying Kubernetes to learn container orchestration at scale. I am building small projects using these technologies to gain hands-on experience.",
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
      "Yes, I actively practice data structures, algorithms, and algorithmic problem solving. To make this practice verifiable, I maintain public coding profiles on five platforms, all of which are linked on my portfolio experience page. I use Codolio as an aggregator to track my overall progress across platforms. I also solve problems regularly on LeetCode under the username mahboob-alam, Codeforces under yurious, Code360 under yurious, and InterviewBit under mahboob-a. I treat problem solving as a daily exercise to keep my systems thinking and analytical skills sharp.",
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
      "I list all my public coding profiles on the experience log page under the /log route. You can view my overall problem solving progress on my Codolio profile at codolio.com/profile/yurious. For individual platform activity, you can check my LeetCode account at leetcode.com/u/mahboob-alam, my Codeforces profile at codeforces.com/profile/yurious, my Code360 page at naukri.com/code360/profile/yurious, and my InterviewBit profile at interviewbit.com/profile/mahboob-a. I keep these links public so my coding habits are open for anyone to verify.",
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
      "I prefer an async-first collaboration style. I write detailed pull request descriptions, document architecture designs, and use written decision records. At NexBell, I led sprint planning sessions and coordinated code reviews for a team of nine engineers. I introduced automated check gates, including linting, typechecking, and tests, in our CI pipeline to catch errors early. I enjoy working in teams that value written documentation and code reviews. This approach allows developers to maintain focus, minimize meeting overhead, and build stable systems together.",
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
      "I focus on automated checks first. In my projects and previous roles, a pull request must pass all continuous integration checks, including code linting, type safety, and unit tests, before review. During review, I focus on system correctness, API design, and database query efficiency. I write comments that can be addressed asynchronously, providing clear explanations for my suggestions. I prefer to keep pull requests small and focused on a single change, which makes reviews faster and reduces the risk of introducing bugs.",
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
      "I check my messages regularly. The fastest way to contact me is by filling out the terminal form on my portfolio's contact page at the /lets-connect route. Submitting that form routes the message directly to my personal Gmail inbox via Resend. Alternatively, you can email me directly at connect.mahboobalam@gmail.com. I review every incoming message myself and typically respond within one to two days. For professional networking or slower inquiries, you can also send me a message on LinkedIn at linkedin.com/in/i-mahboob-alam.",
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
      "Yes, I read and reply to every message myself. The contact form on the /lets-connect page uses Resend to forward messages directly to my email address. I do not share your contact details, subscribe you to any lists, or use your messages to train AI models. The database only stores your name, email, and message temporarily for delivery. I try to reply to all business, project, and recruiting inquiries within twenty-four to forty-eight hours. You can read the full privacy details directly on the contact form page.",
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
      "I keep a link to download my latest PDF resume on the contact page under the /lets-connect route. The link points to a public Google Drive document, which I update whenever I finish a major project or transition to a new role. The resume is formatted as a clean, single-page document designed for technical recruiters. It contains the same information as this online portfolio, but in a printable and parsing-friendly format. If you need a custom version or have issues downloading it, please send me a message through the contact form.",
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
      "My GitHub username is @Mahboob-A, and you can explore all my public repositories at github.com/Mahboob-A. My public projects include Algocode, Movio, DrishtiAI, CuteTube, AirPass, and my Pulumi AWS infrastructure setups. I also share smaller tools like my Load Balancer lab and ImgTwist gallery. Although the repositories for Taply and UnThink are kept private to protect commercial code, I document their architecture and engineering details fully in the projects section of this portfolio.",
    tags: ["github", "open-source", "repos"],
  },
];