# RAG Corpus Guide

**Purpose:** Define what should go into the initial vector corpus so the
dynamic terminal sounds specific, useful, and honest.

The RAG terminal will be only as good as the content it can retrieve. The first
index should combine the existing typed registries with a small set of
human-authored notes.

## Sources Already Available

These can be indexed without asking for new material:

- `data/projects.ts` — project names, taglines, statuses, stack, metrics,
  problem statements, build summaries, links, and case-study notes.
- `data/experience.ts` — companies, roles, periods, bullets, tags, prose notes,
  related projects, education, achievements, and current-status cards.
- `data/blog.ts` — Medium/native post metadata, excerpts, tags, related projects,
  related stack, series, and URLs.
- `data/stack.ts` — technology usage mapping across projects and experience
  references.
- `docs/RAG_TERMINAL.md` — current upgrade runbook and constraints.

## Recommended Additional Corpus Files

Create these under `docs/rag/corpus/` before the first serious reindex:

```txt
docs/rag/corpus/
  bio.md
  hiring.md
  project-deep-cuts.md
  writing-notes.md
  contact-policy.md
  private-boundaries.md
```

### `bio.md`

Use this for first-person context that is not naturally stored in a registry:

- How you describe yourself in one paragraph.
- Why backend/platform engineering is your lane.
- What you want visitors to remember after 30 seconds.
- Location and work preference nuance.
- Current focus: Taply, UnThink, portfolio, writing, learning areas.

### `hiring.md`

Use this for recruiter and hiring-manager answers:

- Role titles you want surfaced.
- Strong-fit companies or teams.
- Remote, hybrid, relocation preferences.
- Interview topics you want to highlight.
- Systems you are comfortable owning end-to-end.
- Topics you are learning but do not want overstated.

### `project-deep-cuts.md`

Use this for the good stuff the registries only summarize:

- Architecture tradeoffs.
- Incidents or debugging stories.
- Scaling constraints.
- What you would rebuild differently.
- Which project best proves which skill.
- Demo readiness: live, private, broken, video-only, repo-only.

### `writing-notes.md`

Use this for better answers about Medium posts:

- 2-4 sentence summary per important article.
- Why the article was written.
- Related projects or experience.
- Best article to recommend for Docker, networking, queues, PostgreSQL, Redis,
  AWS, or system design.

### `contact-policy.md`

Use this to make `contact` answers crisp:

- Best channels for hiring, consulting, Taply, open source, writing, and casual
  messages.
- Expected response time.
- What information someone should include in a first message.
- Anything not accepted through the form.

### `private-boundaries.md`

Use this as the refusal/guardrail corpus:

- Private client names that should not be invented or disclosed.
- Compensation, personal data, and legal/contract details that should not be
  answered.
- Projects that are private and should be described only at a high level.
- A short standard fallback: "I do not have public context for that."

## Chunking Strategy

Chunk by semantic object, not by fixed token count first.

| Source | Chunk unit |
|---|---|
| Project registry | One summary chunk + one stack/metrics chunk per project. |
| Experience registry | One role chunk + one impact/metrics chunk per company. |
| Blog registry | One chunk per post. |
| Stack registry | One chunk per technology. |
| Corpus markdown | One chunk per `##` section. |

Each chunk should target roughly 150-450 words. Short chunks are fine when the
source is naturally small.

## Metadata Schema

Every vector should include:

```ts
type RagChunkMetadata = {
  kind:
    | "project"
    | "experience"
    | "education"
    | "blog"
    | "stack"
    | "contact"
    | "boundary"
    | "meta";
  title: string;
  slug?: string;
  url?: string;
  sourcePath: string;
  text: string;
  tags?: string[];
  projects?: string[];
  stack?: string[];
};
```

The `text` field is duplicated in metadata so the API route can build a grounded
prompt from vector results without fetching a second document store.

## Quality Checklist

Before reindexing:

- Every project has one sentence for "what it proves".
- Every live/private/demo-only status is explicit.
- Every employment claim has a date or period.
- Every metric is sourced from a registry or user-authored corpus note.
- Private or uncertain details are marked explicitly.
- Contact answers point to `/lets-connect` and public social links only.

## Data I Still Need From Mahboob

Highest leverage:

- A 100-150 word personal bio in your natural voice.
- Which roles you want the terminal to optimize for.
- Your preferred answer to "Why should we hire you?"
- 3-5 deep technical stories across Taply, UnThink, Algocode, Movio, and DrishtiAI.
- Which projects are safe to discuss publicly and which should stay high-level.

Nice to have:

- Your current availability and notice period wording.
- Better summaries for the Medium series.
- Your current learning priorities with honest confidence levels.
- FAQ-style questions visitors actually ask you.
