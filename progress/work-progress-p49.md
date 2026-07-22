# Phase 49: RAG Dynamic Chat Style and Context Refinement

**Phase:** 49: RAG Dynamic Chat Style and Context Refinement
**Phase status:** done
**Date started:** 2026-07-22

---

## T49.1: RAG dynamic chat response style and context data refinement

**Task status:** done
**Commit:** 22877aa
**Date:** 2026-07-22

### What shipped

- `docs/rag/corpus/system-prompt.md` & `app/api/rag/route.ts`:
  - Updated target response length to 120-180 words.
  - Added transition logic to handle third-person questions (referring to "Mahboob", "Mehboob", "he/him") warmly in first person.
  - Added capability and suitability question policies: defend competence confidently in first person, balanced honestly with active learning areas (Go, Terraform, Kubernetes, eBPF) framed positively (quick learning, upcoming projects) only when asked explicitly.
  - Added strict vocabulary filter preventing AI slop words (strive, delve, certainly).
- `docs/rag/corpus/voice.md`:
  - Relaxed directness rules and aligned target word count to 120-180 words.
  - Explicitly banned AI slop and overused words.
- `lib/rag/providers.ts`:
  - Added a code-level stream filter to replace all U+2014 em dashes with standard hyphens in the text stream, ensuring strict punctuation compliance.
- `docs/rag/corpus/bio.md`:
  - Corrected hometown location (originally from Kolkata, relocating to Bangalore, Chennai, NCR).
- `lib/rag/common-questions.ts`:
  - Revised and expanded all 28 curated visitor answers to match the 120-180 word target.
  - Re-wrote answers to start with conversational first-person phrases.
  - Added a capability question entry ("Is Mahboob a capable engineer?").
  - Removed all em dashes from the questions corpus.

### Decisions

- **Code-Level Stream Filtering:** Added a replacement filter (`replace(/—/g, " - ")`) in the server stream inside `streamChat` (in [providers.ts](file:///Users/mehboob/my-codes/my-portfolio/lib/rag/providers.ts)) to completely guarantee em dashes never reach the client.
- **Trigger-Based Capability Balance:** Growth areas (Go, Terraform, Kubernetes, eBPF) and self-defense balancing will only trigger on explicit capability or employability queries. Other normal queries will continue in first person as normal.

### Verified

- `pnpm typecheck` -> Clean.
- `pnpm build` -> Compiled successfully (44/44 static pages).
- Local RAG Endpoint Testing:
  - Query "Is Mahboob a capable engineer?" returns a confident first-person answer, balances with growth areas framed positively, and has no em dashes.
  - Query "What's his strength?" starts with natural first-person statements ("My strongest skill is...") instead of key technical lists.
  - `pnpm rag:reindex --reset` successfully re-populated the Upstash Vector store.
