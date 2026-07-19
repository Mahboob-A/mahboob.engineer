/**
 * app/lets-connect/page.tsx
 *
 * Phase 26 layout:
 *   - Left column: contact form (TerminalBlock) + FAQ section below
 *     it. The FAQ fills the visual real estate the form used to
 *     occupy when the description textarea was taller.
 *   - Right column: Availability + DirectLinks + QuickContext.
 *     QuickContext replaces the FAQ card (FAQ moved to the left).
 *
 * Server Component shell. Interactive form is a separate 'use
 * client' island. Sidebar is also a Server Component.
 */

import type { Metadata } from "next";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSidebar } from "@/components/contact/ContactSidebar";
import { FAQSection } from "@/components/contact/FAQSection";
import { FAQ } from "@/data/contact";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Let's connect",
  "Form, availability, direct links, and answers to the questions I get asked most.",
);

export default function ContactPage() {
  return (
    <InnerLayout
      backHref="/"
      backLabel="← home"
      header={{
        section: "Say hello",
        title: "Let's build something durable.",
        description:
          "Form, availability, direct links, and answers to the questions I get asked most.",
      }}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left column — contact form + FAQ below it */}
        <div>
          <ContactForm />
          <FAQSection items={FAQ} />
        </div>

        {/* Right column — Availability + Direct links + Quick context */}
        <ContactSidebar />
      </div>
    </InnerLayout>
  );
}