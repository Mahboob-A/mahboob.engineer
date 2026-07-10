# Progress Tracking Rulebook

> **Audience:** future AI agent sessions and the human reviewer.
> **Purpose:** give every new session instant context on where this rebuild
> stands, what was decided, what's still open, and what the last shipped
> commit actually contains.

---

## 1. Directory layout

```
progress/
├── progress-rulebook-1.md   ← this file (read first; "1" is the rule version)
├── progress-rulebook-2.md   ← next revision, if rules change
├── T1.1.md  T1.2.md  T1.3.md  T1.4.md  T1.5.md   ← Phase 1 tasks
├── T2.1.md  T2.2.md  T2.3.md  T2.4.md  T2.5.md   ← Phase 2 tasks
├── T3.1.md  …                                  ← Phase 3 tasks
└── …
```

**Rulebook naming:** the rulebook itself uses a numbered suffix
(`progress-rulebook-N.md`) so revisions are versioned. The **current**
rulebook is always the highest-numbered file in the directory. Cold-start
always reads the highest first; older rulebooks stay in git history as the
audit trail of how the process evolved.

One **file per task ID** (T1.1, T1.2 …). The number of files per phase scales
with the actual task list — never pre-create empty files. Add new task files
at the top of the phase when starting the next batch.

## 2. When to write / update a progress file

| Trigger | Action |
|---|---|
| Starting a task | Create the file with a `Status: in-progress` header |
| Task complete | Fill in the body, set `Status: done`, **then commit**, **then** print the short terminal report |
| Decision / caveat surfaces mid-task | Add a `## Decisions` or `## Caveats` block right then — don't wait until the end |
| New session | Read the rulebook + every `Status: done` file + every `Status: in-progress` file in order |

## 3. File format (per task)

```markdown
# T1.1 — Next.js 15 project setup
**Phase:** 1 — Foundation
**Status:** done (or in-progress / blocked)
**Commit:** <short-sha> (or "—")
**Date:** 2026-07-10

## What shipped
- 3–6 bullets describing exactly what got built.
- File paths. No marketing language.

## Decisions
- Anything non-obvious chosen mid-task. Cite the master-doc section.
- "Installed Next.js 16, not 15, because @latest resolves to 16.x" → this.

## Caveats / pending
- Anything that's a known issue, a TODO, or a question for the human.
- "node_modules not committed — install on first checkout" is normal.

## Verified
- The 1–3 commands / actions that prove the task works.
- pnpm typecheck / pnpm build / pnpm lint / pnpm dev / browser check.
```

**Word count per file:** **100–200 words is the default**, but the ceiling is
flexible. **300, 400, 500+ words are all fine when the task demands it** —
e.g. a task with several non-obvious decisions, an architectural pivot, or a
phase handoff deserves more room. **Never pad for length**, but never truncate
a real decision to fit an arbitrary cap. A good test: if a new agent started
cold, would they have all the context they need to continue? If yes, the
length is right.

## 4. Commit order (strict)

For every task:

```
1. Make code changes
2. Run pnpm typecheck (must pass)
3. Update the progress file for this task
4. git add + commit (progress file in the same commit as the code)
5. Print the short terminal report (see §5)
6. Move to the next task
```

Progress files are **source artifacts**, not afterthoughts. They live in git
alongside the code.

## 5. Terminal report (what I print in chat)

After every task commit, print a short terminal report — **5–8 lines max**:

```
✓ T1.2 — Design tokens
  → data/tokens.ts: colors + kwDark + chipColor() + 72 tags verified
  → Decisions: Next.js 16 (not 15), chipColor regex order mauve→amber→slate→sage
  → Caveats: kwLight exported but unused until a light-mode toggle ships
  → Commit: 3980025
```

The user only ever sees this short block. Full detail lives in the
`progress/T*.md` files.

## 6. Cold-start protocol (new session)

At the start of every new session, the agent must:

1. List `progress/` and find the **highest-numbered** `progress-rulebook-*.md`
   — that is the current rulebook. Read it.
2. `ls progress/` to see every task file.
3. `grep -l "Status: in-progress" progress/*.md` to find the active task.
4. Read every `Status: done` file in order (T1.1, T1.2, …) to rebuild context.
5. Cross-reference the latest commit in git: `git log --oneline -10`.
6. **Only then** ask the user what to do next — or continue the active task
   if the user has implicitly asked for it.

This is the contract. The user will not re-explain anything if the progress
files are kept up to date.

## 7. Updating the rulebook itself

When the rules change (e.g. the user just asked for flexible word counts):

1. Create a new file: **`progress/progress-rulebook-N+1.md`** where N is the
   current highest number. **Do not edit the old one in place** — keep the
   full history of how the process evolved.
2. Copy the old file, apply the change, and bump the version metadata.
3. In the new file, add a **Change log** at the top:
   ```markdown
   # Rulebook revision 2
   **Supersedes:** progress-rulebook-1.md (2026-07-10)
   **Date:** 2026-07-10
   **Changed by:** session <N>
   **What changed:** 1-line summary each.
   ```
4. Update §1 references (`progress-rulebook.md` → `progress-rulebook-1.md`)
   everywhere they appear.
5. Commit just the rulebook change as its own commit, so the audit trail is
   clean: `docs(progress): rulebook v2 — flexible word count`.

Cold-start always reads the **highest-numbered** rulebook, so future sessions
automatically pick up the new rules without anyone having to "remember."

## 8. Anti-patterns

- ❌ Skipping the progress file because the task felt "small" — every task
      gets one, no exceptions.
- ❌ Merging two task IDs into one file (T1.2+T1.3) — never.
- ❌ Long terminal reports — keep them scannable.
- ❌ Writing progress in the terminal instead of the file — file is canonical,
      terminal is a digest.
- ❌ Pre-creating empty progress files for tasks not yet started — create
      them when starting the task.
