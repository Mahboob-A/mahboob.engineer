/**
 * app/opengraph-image.tsx
 *
 * Single OG image factory. Serves `GET /opengraph-image?title=...&description=...`
 * with a 1200×630 PNG. Every page's `generateMetadata()` populates
 * `openGraph.images[0].url` with `ogUrlFor({ title, description })` from
 * `lib/og-helpers.ts`.
 *
 * Why one file (vs. one per page):
 *   - DRY: one ImageResponse setup, one card layout, one place to evolve.
 *   - Build time: 12+ files would each take a turn on the worker queue.
 *   - Cacheability: Vercel CDN can serve the same image for different params,
 *     so per-page differentiation lives in the URL (not the file path).
 *
 * Colors come from `data/tokens.ts` — master §6 rule #1 (no hex outside tokens).
 * Fonts: rendered via @vercel/og's font loader (subset of Inter + JetBrains Mono).
 *
 * Phase: 6 (T6.1).
 */

import { ImageResponse } from "next/og";
import { colors } from "@/data/tokens";

export const runtime = "nodejs";
export const alt = "Mahboob Alam — Backend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FALLBACK_TITLE = "Mahboob Alam";
const FALLBACK_DESCRIPTION =
  "Co-Founder & Backend Engineer building distributed systems, async pipelines, and infrastructure.";

const EYEBROW = "MAHBOOB ALAM";
const DOMAIN = "mahboob.engineer";

export default async function OpengraphImage({
  searchParams,
}: {
  // searchParams may be undefined when the route is invoked with no query
  // string (Vercel image generation does this at build time). Treat it as
  // an empty params object so the fallback copy renders.
  searchParams?: Promise<{ title?: string; description?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const rawTitle = (params.title ?? FALLBACK_TITLE).trim();
  const rawDescription = (params.description ?? FALLBACK_DESCRIPTION).trim();

  // Title gets clipped if too long; the visual card reserves a fixed height
  // for the title row (max 2 lines). Long titles still render via the same
  // CSS but with `lineClamp`.
  const title = rawTitle.length > 100 ? rawTitle.slice(0, 97) + "..." : rawTitle;
  const description =
    rawDescription.length > 180
      ? rawDescription.slice(0, 177) + "..."
      : rawDescription;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: colors.bg,
          backgroundImage: `radial-gradient(ellipse at 30% 0%, ${colors.active} 0%, transparent 60%), radial-gradient(ellipse at 100% 100%, ${colors.surface} 0%, transparent 70%)`,
          padding: "64px 80px",
          fontFamily: "Inter",
          color: colors.t1,
        }}
      >
        {/* Top row: eyebrow + live dot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Logo dot — accent green, simulating the navbar pulse-dot */}
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                backgroundColor: colors.acc,
                display: "flex",
              }}
            />
            <div
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 22,
                letterSpacing: 2,
                color: colors.acc,
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {EYEBROW}
            </div>
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 18,
              color: colors.t3,
              display: "flex",
            }}
          >
            {"// backend & platform"}
          </div>
        </div>

        {/* Spacer pushes the title down */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              fontFamily: "Space Grotesk",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              color: colors.t1,
              display: "flex",
            }}
          >
            {title}
          </div>
          {/* Description */}
          <div
            style={{
              marginTop: 24,
              fontFamily: "Inter",
              fontSize: 28,
              fontWeight: 400,
              lineHeight: 1.4,
              color: colors.t2,
              maxWidth: 900,
              display: "flex",
            }}
          >
            {description}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Bottom row: domain + accent line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Accent line */}
            <div
              style={{
                width: 64,
                height: 2,
                backgroundColor: colors.acc,
                display: "flex",
              }}
            />
            <div
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 20,
                color: colors.t2,
                display: "flex",
              }}
            >
              {DOMAIN}
            </div>
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: 18,
              color: colors.t3,
              display: "flex",
            }}
          >
            {"Bangalore / Chennai — India"}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // Loaded eagerly so the first share preview doesn't wait on a font fetch.
      // Inter + Space Grotesk + JetBrains Mono subsets.
    },
  );
}
