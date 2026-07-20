# Phase 48 — Hometown location correction (Kolkata), em dash ban rule & 60+ single-word thinking terms

**Phase:** 48 — Hometown location correction (Kolkata), em dash ban rule & 60+ single-word thinking terms
**Phase status:** done
**Date started:** 2026-07-21

---

## T48.1 — Kolkata hometown update, strict em dash ban & expanded thinking vocabulary

**Task status:** done
**Commit:** `<this commit>`
**Date:** 2026-07-21

### What shipped

- `docs/rag/corpus/system-prompt.md` & `app/api/rag/route.ts` — updated location & style rules:
  - Corrected location identity: Mahboob is based in Kolkata (hometown), West Bengal, India. Open to remote backend/platform roles or relocating to tech hubs like Bangalore, Chennai, NCR, etc.
  - Added strict punctuation rule: `NEVER use em dashes ("—") in your answers under any circumstances. Instead, use simple, easy words, smooth transition words, commas, or periods to keep the tone natural and conversational.`
- `components/hero/HeroTerminal.tsx` — updated static payload & thinking list:
  - Updated `whoami` static command payload: `"Based in Kolkata (hometown). Open to remote or relocating to Bangalore / Chennai / NCR."`
  - Extended `SINGLE_WORD_THINKING_TERMS` to 60+ single-word terms including `"Mehboobing"`, `"Mahboobing"`, `"Engineering"`, `"Optimizing"`, `"Architecting"`, `"Refactoring"`, `"Profiling"`, `"Benchmarking"`, `"Compiling"`.
- `progress/work-progress-p48.md` — this file.

### Verified

- `pnpm typecheck` → clean.
- `pnpm build` → 44/44 static pages compiled clean.
