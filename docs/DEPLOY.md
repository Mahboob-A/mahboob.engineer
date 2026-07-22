# Deploying mahboob.engineer

Runbook for the production deploy. Targets Vercel. If you're on a different
host, the same env vars + OAuth app apply; only the Vercel-specific UI steps
change.

---

## 1. Prerequisites

- A GitHub account with admin access to `Mahboob-A/mahboob.engineer`.
- A Vercel account linked to your GitHub.
- A domain (`mahboob.engineer`) — Cloudflare / Porkbun / Namecheap etc.

---

## 2. Pre-deploy sanity

```bash
pnpm install
pnpm typecheck   # must pass clean
pnpm lint        # must pass clean
pnpm build       # must build with 0 warnings
```

If any of these fail, fix before pushing.

---

## 3. Push to GitHub

```bash
GIT_AUTHOR_NAME="Mahboob Alam" \
GIT_AUTHOR_EMAIL="connect.mahboobalam@gmail.com" \
GIT_COMMITTER_NAME="Mahboob Alam" \
GIT_COMMITTER_EMAIL="connect.mahboobalam@gmail.com" \
git push origin main
```

Vercel will auto-build on push (if the project is already imported).

---

## 4. Vercel project import

If this is the first deploy:

1. Open https://vercel.com/new
2. "Import" `Mahboob-A/mahboob.engineer`.
3. Framework preset: **Next.js** (auto-detected).
4. Root directory: `.` (repo root).
5. Build command: `pnpm build` (auto-detected from `package.json`).
6. Install command: `pnpm install` (auto-detected).
7. Skip the "Environment Variables" step for now — we'll set them in step 5.
8. Click **Deploy**. The first build will succeed (with `local` Keystatic
   storage, which is fine for the preview URL).

---

## 5. Environment variables

In Vercel → Project → Settings → Environment Variables, add the following
for **Production** (and optionally Preview / Development if you want them
on preview deploys):

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://mahboob.engineer` | Public; embedded in OG images |
| `RESEND_API_KEY` | resend.com → API Keys | Contact form backend |
| `KEYSTATIC_SECRET` | `openssl rand -hex 32` | Signs admin session cookies |
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub OAuth App (step 6) | |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub OAuth App (step 6) | |
| `KEYSTATIC_GITHUB_REPO_OWNER` | `Mahboob-A` | |
| `KEYSTATIC_GITHUB_REPO_NAME` | `mahboob.engineer` (or `my-portfolio`) | matches the GitHub repo name |

Trigger a redeploy after setting these: Vercel → Deployments → "..." →
"Redeploy".

---

## 6. GitHub OAuth app for Keystatic

The Keystatic admin at `/keystatic` authenticates via GitHub OAuth so you
can sign in with the same GitHub account that owns the repo.

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**.
3. Fill in:
   - **Application name:** `mahboob.engineer — Keystatic`
   - **Homepage URL:** `https://mahboob.engineer`
   - **Authorization callback URL:** `https://mahboob.engineer/api/keystatic/github/oauth/callback`
4. Click **Register application**.
5. On the next page, click **Generate a new client secret**.
6. Copy the **Client ID** and the **Client secret** into the matching
   Vercel env vars from step 5.
7. Redeploy.

> ⚠️ The callback URL must match the deployed domain **exactly**. If
> `mahboob.engineer` isn't attached yet, set the callback to your Vercel
> preview URL (`https://my-portfolio-xxx.vercel.app/api/keystatic/github/oauth/callback`)
> temporarily, then update after the domain attaches.

---

## 7. Attach the domain

1. Vercel → Project → Settings → Domains.
2. Type `mahboob.engineer`.
3. Vercel shows the DNS records you need to add at your registrar:
   - Usually an `A` record for the apex.
   - A `CNAME` for `www`.
4. Add the records at your registrar (Cloudflare / Porkbun / etc.).
5. Wait for DNS propagation — up to 48h, usually <1h.
6. Vercel auto-issues a Let's Encrypt cert once DNS resolves.

---

## 8. Post-deploy verification

Visit `https://mahboob.engineer` and check:

- [ ] Landing page renders all 6 sections.
- [ ] Hero's Algocode diagram animates.
- [ ] `/work` filter chips narrow the grid correctly.
- [ ] `/work/algocode` case study renders (architecture diagram + metrics + prose).
- [ ] `/stack` D3 graph renders (desktop only).
- [ ] `/writing` lists 17+ posts (3 native + 14 Medium via RSS).
- [ ] `/writing/linux-networking-part-1` renders the native MDX.
- [ ] `/contact` form submits (check Resend dashboard for the email).
- [ ] `/game` desktop gate: shows "best on desktop" card at <md.
- [ ] `/keystatic` admin loads + GitHub OAuth flow completes.
- [ ] `/sitemap.xml` returns valid XML.
- [ ] `/robots.txt` returns valid text.
- [ ] Browser DevTools → Network → `<h1>` request → headers include
      `X-Content-Type-Options: nosniff`.

---

## 9. (Optional) Verify a custom Resend sender

The contact form defaults to `onboarding@resend.dev` (Resend's free-tier
verified sender). To use `portfolio-dm@mahboob.engineer`:

1. Resend dashboard → Domains → Add Domain → `mahboob.engineer`.
2. Add the DNS records Resend shows you.
3. Wait for verification (usually <1h).
4. Resend → Domains → `mahboob.engineer` → click → "Add Sender".
5. Update `app/api/contact/route.ts`: replace `from: "onboarding@resend.dev"`
   with `from: "portfolio-dm@mahboob.engineer"`.
6. Commit + push.

---

## 10. Rollback

If a deploy breaks:

- **Vercel → Deployments → click a previous green deploy → "Promote to Production"**
  reverts to the prior commit in ~30s.
- For code-level rollback:
  ```bash
  git revert <bad-commit-sha>
  git push origin main
  ```

---

## Troubleshooting

- **`/keystatic` returns 500 in production** → env vars missing. Check
  Vercel → Settings → Environment Variables. The Keystatic config hard-fails
  on missing OAuth env vars in production (Phase 6 T6.6).
- **OG image doesn't render on Twitter** → check the absolute URL in the
  HTML (`view-source:https://mahboob.engineer`). Twitter needs an absolute
  URL; `NEXT_PUBLIC_SITE_URL` must be set.
- **Phaser canvas shows black screen on mobile** → `/game` shows the
  desktop-only gate at <md (T6.7). On a real phone, you should see the
  "Backend City is best on desktop" card.
- **Sitemap missing `/writing/[slug]` posts** → `lib/mdx.ts` requires
  `content/posts/` to exist with `.mdx` files. If empty, no entries.
- **Lighthouse scores below 90** → run `pnpm build` then `pnpm start`
  locally; check the Chrome DevTools Lighthouse tab. Most regressions are
  images/CSS, not the framework.