# Phase 67 Progress: Founding Engineer Positioning & Taply Sandbox Editable Links

## Overview
Implement 2 major features across the portfolio and RAG knowledge base:
1. Position Mahboob as actively available and exceptionally suited for **Founding Engineer** roles (alongside Series A-C startups) with end-to-end product ownership and multi-hat agility.
2. Upgrade `/work/taply` Profile Customizer simulation sandbox to support inline link editing (labels, URLs, add/delete, reset defaults) with instantaneous real-time sync to the preview viewport.

---

## Tasks

- [x] `T67.1`: Update data/contact.ts with Founding Engineer availability, FAQ, and quick context.
- [x] `T67.2`: Update docs/rag/corpus docs (system-prompt.md, hiring.md, contact-policy.md, bio.md) with Founding Engineer directives.
- [x] `T67.3`: Update lib/rag/common-questions.ts with dedicated Founding Engineer Q&A and updated company fit target.
- [x] `T67.4`: Upgrade components/work/TaplySimulation.tsx with UPDATE_LINK reducer action and editable link controls.
- [x] `T67.5`: Run full verification and update walkthrough report.

---

## T67.1: Contact Data Update for Founding Engineer Fit

**Task status:** done
**Commit:** 8202ec4
**Date:** 2026-08-22

### What shipped
- `data/contact.ts`:
  - Updated `AVAILABILITY`: `Available for Founding Engineer roles (remote / on-site)`.
  - Updated `FAQ`: Emphasized that Founding Engineer roles and Series A through C are where Mahboob thrives, bringing strong product ownership, stakeholder/meeting management, backend and devops expertise, and multi-hat agility.
  - Updated `QUICK_CONTEXT_FITS`: Included Founding Engineer, Backend, and DevOps role inquiries.

---

## T67.2: RAG Corpus Updates for Founding Engineer Fit

**Task status:** done
**Commit:** 3952208
**Date:** 2026-08-22

### What shipped
- `docs/rag/corpus/system-prompt.md`:
  - Added directive `FOUNDING ENGINEER & ROLE FIT` instructing the LLM to highlight Mahboob's active availability and top suitability for Founding Engineer roles and Series A-C startups.
- `docs/rag/corpus/hiring.md`:
  - Updated `Strong Fit` to explain how Mahboob's solo-founder background (UnThink, Taply) translates directly to early-stage multi-hat agility.
- `docs/rag/corpus/contact-policy.md`:
  - Included Founding Engineer inquiries in good reasons to contact.

---

## T67.3: Curated Common Questions Dataset Update

**Task status:** done
**Commit:** 67b0428
**Date:** 2026-08-22

### What shipped
- `lib/rag/common-questions.ts`:
  - Added dedicated Q&A `title: "Is Mahboob open to Founding Engineer roles"`.
  - Updated `What kind of company is Mahboob looking for` to lead with Founding Engineer and Series A-C.

---

## T67.4: Taply Profile Customizer Editable Links Sandbox

**Task status:** done
**Commit:** 9f6a9c3
**Date:** 2026-08-22

### What shipped
- `components/work/TaplySimulation.tsx`:
  - Added `UPDATE_LINK` and `RESET_LINKS` actions to `sandboxReducer`.
  - Upgraded the `3. Active Links` section with inline Title and URL inputs, `[+ Add Link]` button, `[del]` button, and `[reset]` defaults button.
  - Any edit updates the live viewport preview on the right (and full public viewport) in real time across all 4 layout templates (Classic, Hero, Compact, Banner) while preserving default links on initial load.
EOF
