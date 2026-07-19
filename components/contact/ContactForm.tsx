/**
 * components/contact/ContactForm.tsx
 *
 * Shared contact form — used by both the landing `Contact` section
 * (T2.7 refactored) and the standalone /contact page (T3.5). Lifted
 * out of components/sections/Contact.tsx so the data + behavior live
 * in one place.
 *
 * 'use client' — owns form state + async submit handler.
 *
 * Submit paths:
 *   1. Primary: POSTs JSON to /api/contact → server emails via Resend.
 *      On 200 → success toast + clear form. On non-200 → error toast.
 *   2. Fallback: a secondary "or open your mail client →" link below
 *      the submit button. Pre-fills subject + body via mailto: so a
 *      user without JS, with no env var, or just preferring email
 *      client works.
 */

"use client";

import { useState, type FormEvent } from "react";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { Toast } from "@/components/ui/Toast";
import {
  CONTACT_LABELS,
  bucketFor,
} from "@/data/contact";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  /* Toast copy. Two pieces of state — one for the message, one for
     the variant. We render a single Toast component conditionally. */
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"ok" | "err">("ok");

  const isSubmitting = status === "submitting";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, email, label }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setToastVariant("err");
        setToastMessage(
          body?.error
            ? `Couldn't reach the server — ${body.error}. Try the mailto link below.`
            : "Couldn't reach the server. Try the mailto link below.",
        );
        setStatus("error");
        return;
      }
      setToastVariant("ok");
      setToastMessage("Message received. I'll reply within 24h.");
      setStatus("success");
      setTitle("");
      setDescription("");
      setEmail("");
      setLabel(null);
    } catch {
      setToastVariant("err");
      setToastMessage("Network error. Try the mailto link below.");
      setStatus("error");
    }
  }

  /* Build the mailto URL with subject + body pre-filled. */
  const mailtoHref = (() => {
    const subject = label ? `[${label}] ${title}` : title || "Hello";
    const body = [
      description,
      "",
      `— ${email || "(no email provided)"}`,
    ]
      .filter(Boolean)
      .join("\n");
    const params = new URLSearchParams({ subject, body });
    return `mailto:connect.mahboobalam@gmail.com?${params.toString()}`;
  })();

  return (
    <TerminalBlock label="connect — submit a ticket">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="title" htmlFor="cf-title">
          <input
            id="cf-title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are we building?"
            disabled={isSubmitting}
            className={inputClass}
          />
        </Field>

        <Field label="description" htmlFor="cf-description">
          <textarea
            id="cf-description"
            required
            rows={3}
            maxLength={1500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Context, links, constraints. The more specific, the better."
            disabled={isSubmitting}
            className={cn(inputClass, "min-h-[80px] resize-y leading-[1.55]")}
          />
        </Field>

        <Field label="email" htmlFor="cf-email">
          <input
            id="cf-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            disabled={isSubmitting}
            className={cn(inputClass, "font-mono")}
          />
        </Field>

        <Field label="label" htmlFor={undefined}>
          <div
            id="cf-label"
            role="radiogroup"
            aria-label="Inquiry type"
            className="flex flex-wrap gap-1.5"
          >
            {CONTACT_LABELS.map((opt) => {
              const active = label === opt.key;
              const bucket = bucketFor(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={isSubmitting}
                  onClick={() => setLabel(active ? null : opt.key)}
                  className={cn(
                    "font-mono text-[11px] font-medium tracking-[0.3px]",
                    "rounded-[4px] px-[10px] py-[5px] leading-none",
                    "border transition-colors",
                    "disabled:cursor-not-allowed disabled:opacity-60",
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
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-2">
          <p className="text-t3 font-mono text-[11px]">
            ~ average reply: within 24h
          </p>
          <div className="flex items-center gap-3">
            <a
              href={mailtoHref}
              className="text-t3 hover:text-t1 font-mono text-[11.5px] underline-offset-4 transition-colors hover:underline"
              aria-label="Open your mail client pre-filled with this form's content"
            >
              or open your mail client →
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "bg-acc text-bg hover:bg-t1 border-border inline-flex items-center gap-2 rounded-[6px] border px-5 py-2.5",
                "font-mono text-[12px] font-semibold tracking-[0.5px] transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-70",
              )}
            >
              {isSubmitting ? "sending…" : "submit →"}
            </button>
          </div>
        </div>
      </form>

      {toastMessage ? (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
          className={cn(
            toastVariant === "err" ? "border-amber/60 bg-elev" : undefined,
          )}
        />
      ) : null}
    </TerminalBlock>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Helpers — local to this file. If they get reused in another form,
   lift to components/contact/.
   ───────────────────────────────────────────────────────────────────── */

const inputClass = cn(
  "w-full bg-transparent",
  "border-b border-border focus:border-acc",
  "text-t1 placeholder:text-t3/70",
  "py-2 px-0",
  "outline-none",
  "text-[13.5px] leading-[1.5]",
  "transition-colors",
  "disabled:opacity-60 disabled:cursor-not-allowed",
);

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

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string | undefined;
  children: React.ReactNode;
}) {
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