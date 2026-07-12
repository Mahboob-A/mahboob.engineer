/**
 * components/sections/Contact.tsx
 *
 * The "05 / OPEN AN ISSUE" section on `/`. Per master §2 +
 * flat mockup — terminal-style contact form on the left, a
 * vertical quick-links list on the right.
 *
 * Layout:
 *   [Section header — eyebrow + title + description]
 *   [2-col grid: lg:grid-cols-[1.7fr_1fr]]
 *     LEFT  → <TerminalBlock> with form
 *               - title input
 *               - description textarea
 *               - email input
 *               - 5 label chips (hiring / taply-collab / consulting /
 *                 open-source / just-saying-hi)
 *               - submit button
 *               - on submit → toast (auto-dismiss 3.2s) + form reset
 *     RIGHT → "find me elsewhere" card with 5 quick-links
 *
 * Section element: <section id="contact" …> — matches the Navbar's
 * `#contact` anchor.
 *
 * Form is interactive ('use client' on this whole file). No real
 * backend — the submit just shows the toast and clears the fields.
 */

"use client";

import { useState, type FormEvent } from "react";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

/* ─── Label options for the chip row ─────────────────────────────────────
   Each label gets a bucket via `bucketFor()` below — drives color +
   active-state styling. Values match the flat mockup's intent. */

type LabelKey =
  | "hiring"
  | "taply-collab"
  | "consulting"
  | "open-source"
  | "just-saying-hi";

const LABELS: { key: LabelKey; text: string }[] = [
  { key: "hiring", text: "hiring" },
  { key: "taply-collab", text: "taply-collab" },
  { key: "consulting", text: "consulting" },
  { key: "open-source", text: "open-source" },
  { key: "just-saying-hi", text: "just-saying-hi" },
];

/** Map a label key → its visual bucket. Drives `data-bucket` for CSS hooks. */
function bucketFor(key: LabelKey): "sage" | "slate" | "amber" | "mauve" {
  switch (key) {
    case "hiring":
      return "sage";
    case "taply-collab":
      return "mauve";
    case "consulting":
      return "slate";
    case "open-source":
      return "sage";
    case "just-saying-hi":
      return "amber";
  }
}

/* ─── Quick-links list ───────────────────────────────────────────────────
   Values match master §0.2 + the flat mockup. */

const QUICK_LINKS = [
  {
    label: "Email",
    handle: "connect.mahboobalam@gmail.com",
    href: "mailto:connect.mahboobalam@gmail.com",
  },
  {
    label: "GitHub",
    handle: "@Mahboob-A",
    href: "https://github.com/Mahboob-A",
  },
  {
    label: "LinkedIn",
    handle: "in/i-mahboob-alam",
    href: "https://linkedin.com/in/i-mahboob-alam",
  },
  {
    label: "Medium",
    handle: "@imehboob",
    href: "https://imehboob.medium.com",
  },
  {
    label: "Taply",
    handle: "gettaply.me",
    href: "https://gettaply.me",
  },
] as const;

export function Contact() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState<LabelKey | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend in Phase 2 — just acknowledge + reset.
    setToastOpen(true);
    setTitle("");
    setDescription("");
    setEmail("");
    setLabel(null);
  }

  return (
    <section
      id="contact"
      className="border-border scroll-mt-20 border-t py-[90px]"
    >
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-acc mb-2.5 font-mono text-[13px] tracking-[1px]">
            05 / OPEN AN ISSUE
          </p>
          <h2 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
            Let&apos;s build something durable.
          </h2>
          <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
            Hiring, consulting, a partnership, or just a hello — pick a
            label and tell me what you&apos;re working on.
          </p>
        </div>

        {/* 2-col grid: form (left) + quick-links (right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* LEFT — terminal form */}
          <TerminalBlock label="connect — submit a ticket">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Title */}
              <Field label="title" htmlFor="contact-title">
                <input
                  id="contact-title"
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are we building?"
                  className={inputClass}
                />
              </Field>

              {/* Description */}
              <Field label="description" htmlFor="contact-description">
                <textarea
                  id="contact-description"
                  required
                  rows={5}
                  maxLength={1500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Context, links, constraints. The more specific, the better."
                  className={cn(inputClass, "min-h-[120px] resize-y leading-[1.55]")}
                />
              </Field>

              {/* Email */}
              <Field label="email" htmlFor="contact-email">
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className={cn(inputClass, "font-mono")}
                />
              </Field>

              {/* Label chips */}
              <Field label="label" htmlFor={undefined}>
                <div
                  id="contact-label"
                  role="radiogroup"
                  aria-label="Inquiry type"
                  className="flex flex-wrap gap-1.5"
                >
                  {LABELS.map((opt) => {
                    const active = label === opt.key;
                    const bucket = bucketFor(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        data-bucket={bucket}
                        onClick={() => setLabel(active ? null : opt.key)}
                        className={cn(
                          "font-mono text-[11px] font-medium tracking-[0.3px]",
                          "rounded-[4px] px-[10px] py-[5px] leading-none",
                          "border transition-colors",
                          active
                            ? activeChipClass(bucket)
                            : "bg-card/50 text-t3 hover:text-t1 border-border",
                        )}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Submit row */}
              <div className="mt-1 flex items-center justify-between gap-4 pt-2">
                <p className="text-t3 font-mono text-[11px]">
                  ~ average reply: within 24h
                </p>
                <button
                  type="submit"
                  className="bg-acc text-bg hover:bg-t1 border-border inline-flex items-center gap-2 rounded-[6px] border px-5 py-2.5 font-mono text-[12px] font-semibold tracking-[0.5px] transition-colors"
                >
                  submit →
                </button>
              </div>
            </form>
          </TerminalBlock>

          {/* RIGHT — quick-links card */}
          <aside className="bg-surface border-border rounded-[10px] border p-6 md:p-7">
            <p className="text-t3 mb-4 font-mono text-[12px] tracking-[1px]">
              FIND ME ELSEWHERE
            </p>
            <ul className="flex flex-col gap-1">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    className="hover:border-acc/40 hover:bg-card/40 border-border group flex items-center justify-between gap-3 rounded-[6px] border border-transparent px-3 py-2.5 transition-colors"
                  >
                    <span className="flex flex-col">
                      <span className="text-t1 group-hover:text-acc font-mono text-[12px] font-semibold tracking-[0.5px] transition-colors">
                        {link.label}
                      </span>
                      <span className="text-t3 font-mono text-[11px]">
                        {link.handle}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="text-t3 group-hover:text-acc text-[14px] transition-colors"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-t3 mt-5 font-mono text-[11px] leading-[1.55]">
              Based in Bangalore / Chennai. Open to remote-first roles
              globally.
            </p>
          </aside>
        </div>
      </div>

      {toastOpen && (
        <Toast
          message="Message received. I'll reply within 24h."
          onClose={() => setToastOpen(false)}
        />
      )}
    </section>
  );
}

/* ─── Small helpers (kept at bottom — purely presentational) ────────────── */

const inputClass = cn(
  "w-full bg-transparent",
  "border-b border-border focus:border-acc",
  "text-t1 placeholder:text-t3/70",
  "py-2 px-0",
  "outline-none",
  "text-[13.5px] leading-[1.5]",
  "transition-colors",
);

/** Returns Tailwind classes for the "selected" state of a label chip. */
function activeChipClass(bucket: "sage" | "slate" | "amber" | "mauve") {
  switch (bucket) {
    case "sage":
      return "bg-acc-dim text-acc border-acc/50";
    case "slate":
      return "bg-card text-t1 border-border-s";
    case "amber":
      return "bg-amber-dim text-amber border-amber/40";
    case "mauve":
      return "bg-card text-t1 border-border-s";
  }
}

interface FieldProps {
  label: string;
  htmlFor: string | undefined;
  children: React.ReactNode;
}

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-t3 font-mono text-[11px] tracking-[0.5px]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}