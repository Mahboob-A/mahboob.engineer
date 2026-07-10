import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Display font — used for h1/h2/section titles
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Body font — used for paragraphs, lists, general text
const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Mono font — used for code, terminal blocks, chips, badges, KWs
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mahboob.engineer"),
  title: {
    default: "Mahboob Alam — Co-Founder & Backend Engineer",
    template: "%s — Mahboob Alam",
  },
  description:
    "Co-Founder & Backend Engineer building distributed systems, async pipelines, and infrastructure. Creator of Taply and UnThink. Writes The Backend Diaries.",
  keywords: [
    "Mahboob Alam",
    "Backend Engineer",
    "Django",
    "Distributed Systems",
    "Taply",
    "UnThink",
    "The Backend Diaries",
  ],
  authors: [{ name: "Mahboob Alam", url: "https://mahboob.engineer" }],
  creator: "Mahboob Alam",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mahboob.engineer",
    siteName: "mahboob.engineer",
    title: "Mahboob Alam — Co-Founder & Backend Engineer",
    description:
      "Distributed systems, async pipelines, and infrastructure. Co-founder at Taply. Building UnThink.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahboob Alam — Co-Founder & Backend Engineer",
    description:
      "Distributed systems, async pipelines, and infrastructure. Co-founder at Taply.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="font-body flex min-h-full flex-col bg-[#172318] text-[#D8EEE2]">
        {children}
      </body>
    </html>
  );
}
