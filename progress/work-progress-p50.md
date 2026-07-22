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
**Commit:** cd1f723
**Date:** 2026-07-22

### What shipped

- `app/api/contact/route.ts`:
  - Updated the `FROM_EMAIL` constant from `"onboarding@resend.dev"` to `"noreply@mahboob.engineer"`.

### Decisions

- **Custom Domain Sender**: Used the verified custom domain `mahboob.engineer` to lift the Resend free-tier sandbox restrictions, allowing the portfolio to forward emails directly to `connect.mahboobalam@gmail.com`.

### Verified

- `pnpm typecheck` -> Clean.

