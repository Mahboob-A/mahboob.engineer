A. Current portfolio: https://mahboob.engineer/

B. My Projects 

DrishtiAI: https://github.com/Mahboob-A/drishti-ai/blob/main/README.md

Datalineage-Doctor: https://github.com/Mahboob-A/datalineage-doctor/blob/main/README.md

Algocode: https://github.com/Mahboob-A/algocode/blob/main/README.md

Movio: https://github.com/Mahboob-A/movio/blob/main/README.md

Cutetube: https://github.com/Mahboob-A/cutetube/blob/main/README.md

Airpass: https://github.com/Mahboob-A/airpass/blob/main/README.md

Pulumi backend: https://github.com/Mahboob-A/scalable-aws-infra-backend-pulumi/blob/main/README.md

ImpTwist: https://github.com/Mahboob-A/ImgTwist/blob/main/README.md

Practical Load balancer: https://github.com/Mahboob-A/Load-Balancer-Nginx-Docker/blob/main/README.md

C. SaaS
Taply: https://gettaply.me/ 
Taply product links: 
 a. https://gettaply.me/product/digital-profile 
b. https://gettaply.me/product/nfc-card
c. https://gettaply.me/product/profile-builder
d. https://gettaply.me/product/analytics
e. https://gettaply.me/product/teams

Unthink: Currently in development, may release in August, 2026. See bottom below the summary of Unthink, as well as read from @portfolio-master-doc.md for more. 


D. Socials 
see @portfolio-master-doc.md for more. 


Unthink:

# Project Summary — Cold Start Orientation

**Project:** UnThink
**For:** Any AI agent starting a new session with no prior context
**Read time:** 5 minutes

---

## What Is UnThink?

UnThink is a fragment-first personal knowledge base for engineers. The core
action is: select text on any webpage, right-click, click "Send to UnThink".
The fragment is saved, classified by AI, and organised into a folder hierarchy
automatically. The user never names a folder or assigns a tag. They just save
and search.

**The single most important product principle:** The unit of saving is a
fragment (2–4 lines), not a page. This shapes every architectural decision.

---

## System Architecture (ASCII)

```
Browser (Extension)          Browser (Dashboard)
        │                           │
        │ HTTPS POST                │ HTTPS + SSE
        ▼                           ▼
    ┌─────────── Nginx ───────────────────┐
    │   /api/*  →  Django :8000           │
    │   /ai/*   →  FastAPI :8001          │
    │   /events/* → FastAPI :8001 (SSE)   │
    │   /*      →  React (static)         │
    └─────────────────────────────────────┘
              │                   │
        ┌─────┘                   └─────┐
        ▼                               ▼
  Django :8000                   FastAPI :8001
  (auth, quota,                  (AI classify,
   save API,                      SSE stream,
   folder API,                    Redis sub)
   search API)
        │                               ▲
        │ enqueue task                  │ HTTP POST /ai/classify/
        ▼                               │
      Redis :6379 ──────────── Celery Worker
      (broker +                (classify task,
       pub/sub)                 scraping,
                                report gen)
              │
              ▼
        PostgreSQL :5432
        (all persistent data)

External:  Gemini Flash API  ←── Celery Worker
           Jina Reader API   ←── Celery Worker
           Firecrawl API     ←── Celery Worker (fallback)
```

---

## Tech Stack at a Glance

| Layer | Technology | Notes |
|---|---|---|
| Django 5.x + DRF | Business logic, auth, DB | Port 8000 |
| FastAPI 0.110+ | AI pipeline, SSE | Port 8001 |
| Celery 5.x | Async tasks | 3 queues: classification, scraping, reports |
| Redis 7.x | Celery broker + SSE pub/sub | Port 6379 |
| PostgreSQL 16.x | Primary DB | Port 5432 |
| React 18.x | Dashboard frontend | Port 3000 (dev) |
| Manifest V3 JS | Browser extension | Chromium only |
| Gemini 2.0 Flash | AI classification | Configurable via env var |
| UV | Python deps | Not pip |
| Docker Compose | All services | Single VPS deployment |

---

## Data Flow: One Fragment Save

```
1. User selects text, right-clicks → "Send to UnThink"
2. Extension captures: text + tab.url + tab.title
3. Extension POST → Django /api/v1/resources/ (JWT auth)
4. Django: validate → check quota → create Resource(status=PENDING) →
           transaction.on_commit → classify_fragment.delay(resource_id)
5. Django returns 201 {id, status: "pending"} in < 300ms
6. Celery worker: idempotency check → call FastAPI /ai/classify/
7. FastAPI: call Gemini Flash → validate with Pydantic ClassificationOutput
8. Worker: transaction.atomic() → update Resource → create/get folders →
           assign tags, keywords, suggestions → update folder counts
9. Worker: publish SSE event to Redis channel user:{id}:events
10. FastAPI SSE server: forward event to browser
11. Dashboard: card updates from shimmer to classified content
```

---

## Key Decisions (Do Not Change Without ADR)

| Decision | Value |
|---|---|
| Real-time updates | SSE — not WebSocket |
| Scraping: Tier 1 | Extension DOM (window.getSelection) — free, unlimited |
| Scraping: Tier 2A | Jina Reader — free fallback |
| Scraping: Tier 2B | Firecrawl — paid, last resort |
| Access token (extension) | chrome.storage.session (memory only) |
| Refresh token (extension) | httpOnly cookie — no JS access |
| Access token (dashboard) | React state memory only — no localStorage |
| DB writes | Django ORM only — FastAPI never writes to PostgreSQL |
| Task queues | 3 queues: classification (high), scraping (medium), reports (low) |
| Python deps | UV — not pip |
| TDD | FULL — tests before every implementation |

---

## Quota Limits (Free Tier)

| Counter | Limit | Reset |
|---|---|---|
| Right-click saves | 25 / day | Midnight UTC |
| Manual / full-page saves | 10 / day | Midnight UTC |
| Monthly total (right-click + manual) | 250 / month | 1st of month |
| Server-side scrapes | 10 / month | 1st of month |

All limits in `quota_configs` table — editable via Django admin, no restart needed.

---

## Folder Taxonomy

Every fragment is assigned to exactly two folders:

```
Topic folder:  Tech/DevOps/Redis/High-Availability   (AI-generated)
Source folder: Sources/Step-by-step-guide-to-deploy-redis-cluster   (from page title)
```

Sub-directory rules:
- Specific sub-topic identified → create it immediately
- Known parent topic, no specific sub-topic → `General` sub-folder
- No confident topic at all → `Others` under closest parent

**Tags = folder membership.** Every folder name is a tag. Post-MVP: editing
a tag moves the fragment to the corresponding folder.

---

## Document Navigation

Start here for every session:
```
agent-sync/ai-project-status.md   → current sprint, what's done, blockers
agent-sync/ai-rules.md            → all locked decisions and constraints
sprint-tickets/sprint-N-plan.md   → current sprint tickets and test lists
```

Full document index: `agent-sync/ai-project-status.md` Section 3.

---
