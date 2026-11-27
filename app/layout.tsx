import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/motion";
import { ogUrlFor, ogConstants } from "@/lib/og-helpers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "@/components/diagrams/diagrams.css";
import "@/components/sections/skill-graph.css";

/* ──────────────────────────────────────────────────────────────────────
   Fonts — loaded once at the root. Every inner page inherits these
   via the CSS variables below. NEVER add a `<link rel="stylesheet">`
   for fonts anywhere — that's the master §6 rule #10.
   ────────────────────────────────────────────────────────────────────── */

// Display font — h1/h2/section titles ("DEPENDENCY GRAPH", "Backend City", etc.)
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Body font — paragraphs, lists, general prose
const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Mono font — code blocks, chips, terminal, eyebrow labels, KWs
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* ──────────────────────────────────────────────────────────────────────
   Root metadata
   - Default title for the landing page.
   - Title template `"%s — Mahboob Alam"` is auto-applied by every
     child page's `generateMetadata()` (Phase 3+).
   - Open Graph + Twitter defaults so any page that doesn't override
     still gets a sensible share card.
   ────────────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL("https://mahboob.engineer"),
  title: {
    default: "Mahboob Alam | Systems & Backend Engineer (Go · Python · Linux · AWS)",
    template: "%s — Mahboob Alam",
  },
  description:
    "Systems & Backend Engineer (Go · Python · Linux · AWS) building distributed systems, async pipelines, kernel isolation sandboxes, and cloud infrastructure. Writes The Backend Diaries.",
  /* Keywords — the headline stack plus the terms a hiring manager or
     recruiter actually types into a search box.

     Note: `DevOps` and `Django` were dropped here. Django is real
     shipped work (NexBell, Innovative IT, Taply) but the site now
     leads with a systems/backend headline, and `DevOps` was never
     the role. Everything listed below is either the headline stack or
     a system this portfolio can be interviewed on. */
  keywords: [
    "Mahboob Alam",
    "Systems Engineer",
    "Backend Engineer",
    "Go",
    "Golang",
    "Python",
    "Linux",
    "AWS",
    "Distributed Systems",
    "System Design",
    "Async Architecture",
    "Message Queue",
    "RabbitMQ",
    "Redis",
    "PostgreSQL",
    "Docker",
    "Nginx",
    "Pulumi",
    "Infrastructure as Code",
    "Kernel Isolation",
    "Container Networking",
    "Network Namespaces",
    "OpenTelemetry",
    "Microservices",
    "Backend Developer",
    "UnThink",
    "Taply",
    "Algocode",
    "The Backend Diaries",
    "Bangalore",
    "Chennai",
  ],
  authors: [{ name: "Mahboob Alam", url: "https://mahboob.engineer" }],
  creator: "Mahboob Alam",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mahboob.engineer",
    siteName: "mahboob.engineer",
    title: "Mahboob Alam — Systems & Backend Engineer (Go · Python · Linux · AWS)",
    description:
      "Distributed systems, async pipelines, and kernel isolation sandboxes.",
    images: [
      {
        url: ogUrlFor({
          title: "Mahboob Alam",
          description:
            "Distributed systems, async pipelines, and AI infrastructure.",
        }),
        width: ogConstants.width,
        height: ogConstants.height,
        alt: "Mahboob Alam — Systems & Backend Engineer (Go · Python · Linux · AWS)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahboob Alam — Systems & Backend Engineer (Go · Python · Linux · AWS)",
    description:
      "Distributed systems, async pipelines, and kernel isolation sandboxes.",
    images: [
      ogUrlFor({
        title: "Mahboob Alam",
        description:
          "Distributed systems, async pipelines, and AI infrastructure.",
      }),
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Icons — Phase 31.2. RealFaviconGenerator output dropped into
  // /public root. The 32×32 PNG is the default (modern browsers
  // pick the highest-res match); favicon.ico is the legacy
  // fallback for crawlers + older browsers; apple-touch-icon
  // covers iOS home-screen + bookmark icon.
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  // PWA manifest — Phase 31.2. RealFaviconGenerator output.
  // Enables "Add to Home Screen" on Android Chrome + iOS Safari.
  manifest: "/manifest.webmanifest",
};

/**
 * Next.js 16 splits viewport out of metadata — export it separately so the
 * warning "Unsupported metadata viewport" goes away. Matches the colors.bg
 * token from data/tokens.ts.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#172318",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="font-body bg-bg text-t1 flex min-h-full flex-col">
        {/* Skip-link — first focusable element. Phase 6 (T6.4). */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
