# Progress Tracking Rulebook

> **Audience:** future AI agent sessions and the human reviewer.
> **Purpose:** give every new session instant context on where this rebuild
> stands, what was decided, what's still open, and what the last shipped
> commit actually contains.
>
> **This file is the single source of truth** for how progress is recorded.
> Edit it in place when the rules change — there is **only ever one**
> rulebook file.

---

## 1. Directory layout

```
progress/
├── progress-rulebook.md         ← this file (read first in every session)
├── work-progress-p1.md          ← Phase 1 work log (all tasks in Phase 1)
├── work-progress-p2.md          ← Phase 2 work log
├── work-progress-p3.md          ← Phase 3 work log
└── …
```

**Phase file naming:** one file **per phase**, named
`work-progress-p<N>.md` where N is the phase number. Each phase file holds
all tasks executed in that phase — typically 5 tasks per phase, but the
count can flex based on the phase's actual scope.

**Phase file structure:** each `work-progress-pN.md` has:
- A header identifying the phase, status, date.
- One section per task (T1.1, T1.2, …) using the task format defined in §3.
- Tasks are appended **in order as they complete** — never pre-create empty
  sections for tasks not yet started.

**Rulebook:** there is exactly one rulebook, `progress-rulebook.md`. Do not
version it as `progress-rulebook-2.md` etc. Edit in place; preserve git
history of changes via normal commits.

## 2. When to write / update a progress file

| Trigger | Action |
|---|---|
| Starting a phase | Create the phase's `work-progress-pN.md` with the phase header; fill in tasks as they ship |
| Starting a task | Add the task section under the active phase with `Status: in-progress` |
| Task complete | Fill the body, set `Status: done`, **then commit**, **then** print the short terminal report |
| Decision / caveat surfaces mid-task | Add a `## Decisions` or `## Caveats` block right then — don't wait until the end |
| New session | Read this rulebook + every `work-progress-pN.md` in order + cross-check git log |

## 3. Task format (per task, inside its phase file)

```markdown
# Phase 1 — Foundation
**Phase:** 1 — Foundation
**Phase status:** in-progress (or done)
**Date started:** 2026-07-10

---

## T1.1 — Next.js 15 project setup
**Task status:** done (or in-progress / blocked)
**Commit:** <short-sha> (or "—")
**Date:** 2026-07-10

### What shipped
- 3–6 bullets describing exactly what got built.
- File paths. No marketing language.

### Decisions
- Anything non-obvious chosen mid-task. Cite the master-doc section.
- "Installed Next.js 16, not 15, because @latest resolves to 16.x" → this.

### Caveats / pending
- Anything that's a known issue, a TODO, or a question for the human.
- "node_modules not committed — install on first checkout" is normal.

### Verified
- The 1–3 commands / actions that prove the task works.
- pnpm typecheck / pnpm build / pnpm lint / pnpm dev / browser check.
```

**Word count per task:** **100–200 words is the default**, but the ceiling is
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
3. Update the active phase file (work-progress-pN.md) — append/fill this task
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
`progress/work-progress-pN.md` files.

## 6. Cold-start protocol (new session)

At the start of every new session, the agent must:

1. Read `progress/progress-rulebook.md` (this file).
2. `ls progress/` to see every phase file.
3. Read every `work-progress-pN.md` in order (p1, p2, …) to rebuild
   context — each file has all tasks for its phase.
4. Identify the active phase (`Phase status: in-progress`) and the active
   task (`Task status: in-progress` or the last task with no `done`).
5. Cross-reference the latest commit in git: `git log --oneline -10`.
6. **Only then** ask the user what to do next — or continue the active
   task if the user has implicitly asked for it.

This is the contract. The user will not re-explain anything if the progress
files are kept up to date.

## 7. Anti-patterns

- ❌ Skipping the progress file because the task felt "small" — every task
      gets one, no exceptions.
- ❌ One file per task ID (T1.1.md, T1.2.md, …) — use the phase file
      instead. Files-per-phase, tasks-inside-file.
- ❌ Long terminal reports — keep them scannable.
- ❌ Writing progress in the terminal instead of the file — file is canonical,
      terminal is a digest.
- ❌ Pre-creating empty task sections in phase files for tasks not yet
      started — add the section when starting the task.
- ❌ Creating `progress-rulebook-2.md` / `-3.md` etc. — there's one
      rulebook, edited in place. This file owns the rules.
