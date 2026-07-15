/**
 * app/contact/page.tsx
 *
 * The "05 / OPEN AN ISSUE" full-page contact route per master §2.6.
 * Composes InnerLayout + ContactForm (left) + ContactSidebar (right).
 *
 * Server Component shell. Interactive form is a separate 'use client'
 * island (components/contact/ContactForm.tsx). Sidebar is also a
 * Server Component (no state).
 */

import type { Metadata } from "next";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSidebar } from "@/components/contact/ContactSidebar";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  /* Post-Phase 6 bug fix: route renamed /contact → /lets-connect.
     Page title and metadata reflect the new framing. */
  "Let's connect",
  "Form, availability, direct links, and answers to the questions I get asked most.",
);

export default function ContactPage() {
  return (
    <InnerLayout
      backHref="/"
      backLabel="← home"
      header={{
        num: "05",
        section: "OPEN AN ISSUE",
        title: "Let's build something durable.",
        description:
          "Form, availability, direct links, and answers to the questions I get asked most.",
      }}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <ContactForm />
        <ContactSidebar />
      </div>
    </InnerLayout>
  );
}