/**
 * app/icon.tsx
 *
 * Next.js metadata-file convention. Returns a 32×32 PNG generated at
 * build time via `@vercel/og`'s `ImageResponse` — a monogram "MA" in
 * the accent color on the dark background.
 *
 * Replaces `public/favicon.ico` (which was a placeholder) with a
 * proper SVG-equivalent icon. The legacy `favicon.ico` URL is kept
 * as a fallback via the `icons.shortcut` field in `lib/metadata.ts`.
 *
 * Phase 6 (T6.5).
 */

import { ImageResponse } from "next/og";
import { colors } from "@/data/tokens";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
          color: colors.acc,
          fontFamily: "system-ui",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: -1,
          borderRadius: 6,
        }}
      >
        MA
      </div>
    ),
    { ...size },
  );
}