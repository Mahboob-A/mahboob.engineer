# Phase 50: Keystatic & Email Configuration Updates

**Phase:** 50: Keystatic & Email Configuration Updates
**Phase status:** in-progress
**Date started:** 2026-07-22

---

## T50.1: Keystatic repository name fallback update

**Task status:** done
**Commit:** 21ef758
**Date:** 2026-07-22

### What shipped

- `keystatic.config.ts`:
  - Updated the default repository name fallback from `"my-portfolio"` to `"mahboob.engineer"` to align with the actual portfolio repo name.

### Decisions

- **Aligned Fallback Name**: Changed the fallback string directly in the config file to prevent local startup errors if the environment variable `KEYSTATIC_GITHUB_REPO_NAME` is not explicitly set in Vercel or locally.

### Verified

- `pnpm typecheck` -> Clean.

---

## T50.2: Resend contact form custom domain sender update

**Task status:** done
**Commit:** 4c026d1
**Date:** 2026-07-22

### What shipped

- `app/api/contact/route.ts`:
  - Updated the `FROM_EMAIL` constant from `"onboarding@resend.dev"` to `"noreply@mahboob.engineer"`.

### Decisions

- **Custom Domain Sender**: Used the verified custom domain `mahboob.engineer` to lift the Resend free-tier sandbox restrictions, allowing the portfolio to forward emails directly to `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` -> Clean.

---

## T50.3: Resend contact form email custom sender update (portfolio-dm@mahboob.engineer)

**Task status:** done
**Commit:** 8cc43ee
**Date:** 2026-07-22

### What shipped

- `app/api/contact/route.ts`:
  - Updated the `FROM_EMAIL` constant from `"noreply@mahboob.engineer"` to `"portfolio-dm@mahboob.engineer"`.
- `docs/DEPLOY.md`:
  - Updated custom sender setup instructions to reference `portfolio-dm@mahboob.engineer`.

### Decisions

- **Distinguished Sender Address**: Changed the sender username from generic `noreply` to `portfolio-dm` to make outreach from the portfolio easily recognizable and separate from generic provider updates.

### Verified

- `pnpm typecheck` -> Clean.

---

## T50.4: Vercel Web Analytics integration

**Task status:** done
**Commit:** 7b3d6ae
**Date:** 2026-07-22

### What shipped

- `package.json` & `pnpm-lock.yaml`:
  - Installed `@vercel/analytics` package.
- `app/layout.tsx`:
  - Imported and rendered `<Analytics />` from `@vercel/analytics/next` at the root layout level.

### Decisions

- **Framework-optimized integration**: Utilized the Next.js App Router-specific `@vercel/analytics/next` package to track page views and interactions cleanly.

### Verified

- `pnpm typecheck` -> Clean.

---

## T50.5: Dynamic contact emails environment configuration

**Task status:** done
**Commit:** e9e70f5
**Date:** 2026-07-22

### What shipped

- `app/api/contact/route.ts`:
  - Refactored `FROM_EMAIL` and `TO_EMAIL` constants to load dynamically from `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` environment variables using the `env.required()` helper.
- `.env.example` & `.env`:
  - Appended `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` variables.
- `docs/DEPLOY.md`:
  - Updated environment variables reference list and verified custom sender instructions to use the new environment configuration.

### Decisions

- **Environment-Driven Configuration**: Replaced hardcoded values with runtime environment variables to enable email destination/sender updates without code changes or redeploys, satisfying dynamic configuration standards.

### Verified

- `pnpm typecheck` -> Clean.

---

## T50.6: Vercel Speed Insights integration

**Task status:** done
**Commit:** b509854
**Date:** 2026-07-22

### What shipped

- `package.json` & `pnpm-lock.yaml`:
  - Installed `@vercel/speed-insights` package.
- `app/layout.tsx`:
  - Imported and rendered `<SpeedInsights />` from `@vercel/speed-insights/next` at the root layout level.

### Decisions

- **Performance telemetry**: Added Vercel Speed Insights to collect Core Web Vitals to monitor app loading speed and layout stability.

### Verified

- `pnpm typecheck` -> Clean.

---

## T50.7: RAG terminal input word count guardrail

**Task status:** done
**Commit:** 54855a9
**Date:** 2026-07-22

### What shipped

- `components/hero/HeroTerminal.tsx`:
  - Intercepted query submissions exceeding 120 words in dynamic mode client-side, showing a random friendly error message directly in the terminal stream without initiating network requests.
- `app/api/rag/route.ts`:
  - Added backend validation rejecting incoming queries with a `400 Bad Request` if the word count exceeds 120 words.

### Decisions

- **Two-tier Guardrails**: Implemented word-count validation on both frontend and backend to block lengthy, spammy, or role-injection attempts, reducing LLM token consumption and improving platform durability.

### Verified

- `pnpm typecheck` -> Clean.

---

## T50.8: RAG system prompt injection mitigation

**Task status:** done
**Commit:** 2474039
**Date:** 2026-07-22

### What shipped

- `lib/rag/command-map.ts`:
  - Exported `isPotentialPromptInjection` matching helper function to scan for injection vectors (e.g. system prompt probe terms, ignore instructions, jailbreak attempts) and defined `RAG_REJECTION_MESSAGE`.
- `components/hero/HeroTerminal.tsx`:
  - Added client-side detection to intercept potential prompt injections, outputting the standard first-person rejection message instantly without making a network request.
- `app/api/rag/route.ts`:
  - Integrated backend injection validation, returning the same clean rejection message as a standard successful plain-text response when probing/jailbreaking queries bypass client constraints.

### Decisions

- **Defensive Rule Filtering**: Implemented deterministic preprocessing checks on the user question before passing it to the LLM. This prevents prompt leakage by denying queries containing system prompt patterns from ever reaching the model.

### Verified

- `pnpm typecheck` -> Clean.

---

## T50.9: RAG terminal word limit adjustment to 120

**Task status:** done
**Commit:** 1e011cf
**Date:** 2026-07-22

### What shipped

- `components/hero/HeroTerminal.tsx` & `app/api/rag/route.ts`:
  - Updated validation constraint and fallback error messages to allow queries up to 120 words.

### Decisions

- **Expanded limit**: Raised user query limit to 120 words to allow slightly longer queries while maintaining strict guardrails against spam and long token abuse.

### Verified

- `pnpm typecheck` -> Clean.
