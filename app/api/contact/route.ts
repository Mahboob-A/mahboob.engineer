/**
 * app/api/contact/route.ts
 *
 * POST /api/contact — receives the contact form payload, validates it,
 * and emails via Resend to connect.mahboobalam@gmail.com.
 *
 * Returns JSON. On success: { ok: true }. On error: { ok: false, error }.
 *
 * Behavior:
 *   - Validates title (1-120), description (1-1500), email (basic regex),
 *     label (must be one of CONTACT_LABELS keys, or null).
 *   - Reads RESEND_API_KEY from env at request time. Missing key → 500.
 *   - Subject line: `[<label>] <title>` (or `[note] <title>` if no label).
 *   - Body: the description, followed by a blank line + sender email.
 *   - From address: `onboarding@resend.dev` (Resend's verified sender for
 *     the free tier). Switch to a custom verified domain in production.
 *
 * No rate limiting in v1 (Phase 6 polish via Vercel Edge Middleware).
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_LABELS } from "@/data/contact";

/* ─────────────────────────────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────────────────────────────── */

const TO_EMAIL = "connect.mahboobalam@gmail.com";
/* Resend's default verified sender. Replace with `noreply@mahboob.engineer`
   once the domain is verified in the Resend dashboard. */
const FROM_EMAIL = "onboarding@resend.dev";

/* ─────────────────────────────────────────────────────────────────────
   Validation
   ───────────────────────────────────────────────────────────────────── */

interface IncomingPayload {
  title?: unknown;
  description?: unknown;
  email?: unknown;
  label?: unknown;
}

interface ValidatedPayload {
  title: string;
  description: string;
  email: string;
  label: string | null;
}

/* Pragmatic email regex — matches the shape without trying to be RFC 5322
   compliant. Good enough to catch typos before they reach Resend. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(payload: IncomingPayload): ValidatedPayload | { error: string } {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const description =
    typeof payload.description === "string" ? payload.description.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const label =
    typeof payload.label === "string" && payload.label.length > 0
      ? payload.label
      : null;

  if (title.length < 1 || title.length > 120) {
    return { error: "Title must be 1-120 characters." };
  }
  if (description.length < 1 || description.length > 1500) {
    return { error: "Description must be 1-1500 characters." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Email looks invalid." };
  }
  if (label !== null && !CONTACT_LABELS.some((l) => l.key === label)) {
    return { error: "Unknown label." };
  }
  return { title, description, email, label };
}

/* ─────────────────────────────────────────────────────────────────────
   Route Handler
   ───────────────────────────────────────────────────────────────────── */

export async function POST(req: Request): Promise<Response> {
  /* 1. Parse JSON body. */
  let raw: IncomingPayload;
  try {
    raw = (await req.json()) as IncomingPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  /* 2. Validate. */
  const result = validate(raw);
  if ("error" in result) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }

  /* 3. Read API key. Missing → 500 with clear message (caller can
         fall back to the mailto: link). */
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "RESEND_API_KEY is not configured on this server.",
      },
      { status: 500 },
    );
  }

  /* 4. Compose email. */
  const subjectLabel = result.label ?? "note";
  const subject = `[${subjectLabel}] ${result.title}`;
  const text = [
    result.description,
    "",
    `— ${result.email}`,
    `Label: ${result.label ?? "(none)"}`,
  ].join("\n");

  /* 5. Send via Resend. */
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: result.email,
      subject,
      text,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message ?? "Resend rejected the message." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown Resend error.",
      },
      { status: 500 },
    );
  }
}