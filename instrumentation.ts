/**
 * instrumentation.ts
 *
 * Registers the OpenTelemetry tracer provider with Langfuse's span
 * processor. `register()` runs once per server instance, when the Node.js
 * runtime boots — the right place to set up tracing that must outlive a
 * single request.
 *
 * Why this exists: Langfuse Cloud removed the v3 ingestion API
 * (`POST /api/public/ingestion`) on 2026-11-16. The current SDK generation
 * ships traces over OTLP to `POST /api/public/otel/v1/traces` instead, via
 * `@langfuse/otel`'s `LangfuseSpanProcessor`.
 *
 * The route handlers never construct the processor themselves — they reach
 * it through `globalThis.__langfuseSpanProcessor` so they can `forceFlush()`
 * before a serverless function freezes. Routing it through `globalThis`
 * (rather than importing a singleton) keeps `instrumentation.ts` out of the
 * route module graph, which would otherwise pull the OTEL runtime into the
 * edge bundle.
 *
 * Env vars are unchanged from the v3 SDK:
 *   LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_BASE_URL
 *
 * `LANGFUSE_BASE_URL` is region-specific:
 *   EU → https://cloud.langfuse.com
 *   US → https://us.cloud.langfuse.com
 */

import type { LangfuseSpanProcessor } from "@langfuse/otel";

declare global {
  /**
   * The process-wide Langfuse span processor, set by `register()`.
   * `undefined` when Langfuse is not configured (e.g. local dev without
   * keys) — every call site must treat it as optional.
   */
  var __langfuseSpanProcessor: LangfuseSpanProcessor | undefined;
}

export async function register(): Promise<void> {
  /* The edge runtime has no OTEL exporter and no Node tracer provider.
     Only the Node.js runtime can host the span processor. */
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  /* Without keys the processor would build an exporter that fails on every
     span. Skip registration entirely so local dev without Langfuse stays
     quiet and the server still boots. */
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) return;

  const { LangfuseSpanProcessor: SpanProcessor } = await import("@langfuse/otel");
  const { NodeTracerProvider } = await import("@opentelemetry/sdk-trace-node");
  /*
   * NOTE: `@opentelemetry/sdk-trace-node` is marked deprecated upstream in
   * favour of `@opentelemetry/sdk-trace`, but we must stay on the v2 line.
   * `@langfuse/otel@6` peer-requires `@opentelemetry/core ^2.0.1` and
   * `@opentelemetry/sdk-trace-base ^2.0.1`; the v3 successor pulls in
   * `@opentelemetry/core@3`, which would install a second, incompatible copy
   * of OTEL core alongside the v2 one that Langfuse's `SpanProcessor`
   * interface is built against. Revisit when Langfuse bumps its peer range.
   */

  const langfuseSpanProcessor = new SpanProcessor({
    publicKey,
    secretKey,
    baseUrl: process.env.LANGFUSE_BASE_URL,
    /*
     * Serverless functions freeze as soon as the response is delivered, so
     * batched exports are frequently lost. "immediate" sends each span as
     * it ends — the right trade-off for a request-scoped route handler.
     */
    exportMode: "immediate",
    environment: process.env.NODE_ENV || "development",
  });

  const tracerProvider = new NodeTracerProvider({
    spanProcessors: [langfuseSpanProcessor],
  });

  tracerProvider.register();

  globalThis.__langfuseSpanProcessor = langfuseSpanProcessor;
}
