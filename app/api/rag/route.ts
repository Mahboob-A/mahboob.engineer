/**
 * app/api/rag/route.ts
 *
 * POST /api/rag — the dynamic-mode backend for the HeroTerminal.
 *
 * Flow:
 *   1. Validate the JSON body (known command key, optional question).
 *   2. Build an Upstash Vector client (server-side embedding).
 *   3. On first call, verify the index dimension matches the configured
 *      `RAG_UPSTASH_EMBEDDING_DIMENSIONS`. Mismatch → 503.
 *   4. Retrieve top-k chunks via `index.query({ data: question })`.
 *   5. Compose the system message from the cached system-prompt chunk +
 *      voice rules + grounded context.
 *   6. Stream the chat completion through the configured provider
 *      (`LLM_PROVIDER`, default fireworks / gpt-oss-120b).
 *
 * Status codes:
 *   200 — streaming text body
 *   400 — invalid body (unknown command, oversize payload)
 *   503 — dynamic mode not configured (env vars missing, dim mismatch)
 *
 * This route is server-only. It never exposes the configured model, the
 * Upstash index, or the bearer token to the client.
 */

import { Index } from "@upstash/vector";
import { env } from "@/lib/env";
import {
  isRagCommand,
  questionForCommand,
  isPotentialPromptInjection,
  RAG_REJECTION_MESSAGE,
} from "@/lib/rag/command-map";
import { RagProviderConfigurationError } from "@/lib/rag/providers";
import { checkRateLimit, extractClientIp } from "@/lib/rag/rate-limit";
import { Langfuse } from "langfuse";

import { SYSTEM_PROMPT, VOICE_RULES } from "@/lib/rag/system-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUESTION_CHARS = 500;
const DEFAULT_TOP_K = 5;
const VECTOR_NAMESPACE = "portfolio-rag";

type VectorMetadata = Record<string, unknown>;

interface IncomingPayload {
  command?: unknown;
  question?: unknown;
  sessionId?: unknown;
}

interface QueryHit {
  id: string | number;
  score: number;
  metadata?: VectorMetadata;
}

/**
 * Cached dimension-parity check. Computed once per cold start; reused on
 * every subsequent request. If Upstash is unreachable on first call, we
 * fail loud (503) — the route shouldn't pretend to work without a verified
 * index.
 */
let indexInfoCache: { dimension: number } | null = null;
let indexInfoError: Error | null = null;

async function readIndexDimension(
  client: Index<VectorMetadata>,
  expected: number,
): Promise<void> {
  if (indexInfoCache) return;
  if (indexInfoError) throw indexInfoError;
  try {
    const info = await client.info();
    if (info.dimension !== expected) {
      const error = new RagProviderConfigurationError(
        `Upstash index dimension ${info.dimension} does not match RAG_UPSTASH_EMBEDDING_DIMENSIONS=${expected}. ` +
          `Recreate the Upstash index at dimension ${expected} (matching the selected embedding model) and re-run.`,
      );
      indexInfoError = error;
      throw error;
    }
    indexInfoCache = { dimension: info.dimension };
  } catch (error) {
    if (error instanceof RagProviderConfigurationError) throw error;
    const wrapped = new Error(
      `Upstash dimension check failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    indexInfoError = wrapped;
    throw wrapped;
  }
}

function buildGroundedContext(results: readonly QueryHit[]): string {
  if (results.length === 0) {
    return "(no retrieved chunks)";
  }
  return results
    .map((r, i) => {
      const title =
        typeof r.metadata?.title === "string" ? r.metadata.title : "Untitled";
      const kind = typeof r.metadata?.kind === "string" ? r.metadata.kind : "doc";
      const text = typeof r.metadata?.text === "string" ? r.metadata.text : "";
      return `[${i + 1}] (${kind}) ${title}\n${text}`;
    })
    .join("\n\n");
}

export async function POST(req: Request): Promise<Response> {
  /* 0. Rate limit per IP. Returns 429 before any heavy work runs. */
  const ip = extractClientIp(req);
  const rl = await checkRateLimit(ip);
  if (!rl.allowed) {
    const resetTimeSec = Math.max(0, Math.ceil((rl.resetAt - Date.now()) / 1000));
    const minutes = Math.floor(resetTimeSec / 60);
    const seconds = resetTimeSec % 60;
    const message = `Too many requests. I am sorry for the inconvenience, but I have to limit queries to ${rl.limit} per 30 minutes to stop spam, bots, and billing abuse. Please try again in ${minutes}m ${seconds}s.`;

    return new Response(message, {
      status: 429,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "retry-after": resetTimeSec.toString(),
      },
    });
  }

  /* 1. Parse + validate the body. */
  let body: IncomingPayload;
  try {
    body = (await req.json()) as IncomingPayload;
  } catch {
    return badRequest("Invalid JSON body.");
  }
  if (!isRagCommand(body.command)) {
    return badRequest("Unknown or missing command key.");
  }
  const command = body.command;
  const rawQuestion =
    typeof body.question === "string" && body.question.trim().length > 0
      ? body.question.trim()
      : "";

  if (rawQuestion) {
    if (isPotentialPromptInjection(rawQuestion)) {
      return new Response(RAG_REJECTION_MESSAGE, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const wordCount = rawQuestion.split(/\s+/).filter(Boolean).length;
    if (wordCount > 120) {
      return badRequest("Your question is too long. Please keep it under 120 words.");
    }
  }

  const userQuestion =
    rawQuestion.length > 0
      ? rawQuestion.slice(0, MAX_QUESTION_CHARS)
      : command !== "custom"
        ? questionForCommand(command)
        : "Summarize Mahboob Alam's software engineering background.";

  /* 2. Build the Upstash index. Missing credentials → 503. */
  const url = env.optional("UPSTASH_VECTOR_REST_URL", "");
  const token = env.optional("UPSTASH_VECTOR_REST_TOKEN", "");
  if (!url || !token) {
    return notConfigured(
      "Vector store is not configured. Set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN.",
    );
  }
  const expectedDimension = Number.parseInt(
    env.optional("RAG_UPSTASH_EMBEDDING_DIMENSIONS", "1536"),
    10,
  );
  if (!Number.isFinite(expectedDimension)) {
    return notConfigured("RAG_UPSTASH_EMBEDDING_DIMENSIONS must be an integer.");
  }

  const client = new Index<VectorMetadata>({ url, token });
  const namespaceClient = client.namespace(VECTOR_NAMESPACE);

  try {
    await readIndexDimension(client, expectedDimension);
  } catch (error) {
    return notConfigured(
      error instanceof Error ? error.message : "Upstash dimension check failed.",
    );
  }

  /* 3. Resolve the chat provider. Missing provider key → 503. */
  let modelClient;
  try {
    const { getRagModelClient } = await import("@/lib/rag/providers");
    modelClient = getRagModelClient();
  } catch (error) {
    return notConfigured(
      error instanceof Error ? error.message : "Chat provider is not configured.",
    );
  }

  /* 4. Stream the chat completion and trace it via Langfuse. */
  const langfusePublic = process.env.LANGFUSE_PUBLIC_KEY;
  const langfuseSecret = process.env.LANGFUSE_SECRET_KEY;
  const langfuseHost = process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com";

  const langfuse = langfusePublic && langfuseSecret
    ? new Langfuse({
        publicKey: langfusePublic,
        secretKey: langfuseSecret,
        baseUrl: langfuseHost,
      })
    : null;

  const trace = langfuse
    ? langfuse.trace({
        name: "rag-chat",
        userId: ip,
        sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
        tags: [process.env.NODE_ENV || "development"],
        input: { command, question: userQuestion },
      })
    : null;

  const retrieveContextSpan = trace?.span({
    name: "retrieve-context",
    input: { query: userQuestion },
  });

  let retrieval: QueryHit[] = [];

  try {
    retrieval = await namespaceClient
      .query({
        data: userQuestion,
        topK: DEFAULT_TOP_K,
        includeMetadata: true,
      })
      .catch((error: unknown) => {
        throw new Error(
          `Upstash query failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    retrieveContextSpan?.update({ level: "ERROR", statusMessage: errorMsg });
    retrieveContextSpan?.end();
    trace?.update({
      output: `Error: ${errorMsg}`,
    });
    if (langfuse) {
      await langfuse.flushAsync();
    }
    throw error;
  }

  // Filter out system prompt, voice, or boundary chunks if any exist in index
  const cleanRetrieval = retrieval.filter(
    (r) =>
      r.metadata?.kind !== "system-prompt" &&
      r.metadata?.kind !== "voice" &&
      r.metadata?.kind !== "boundary",
  );
  const context = buildGroundedContext(cleanRetrieval);

  retrieveContextSpan?.end({
    output: {
      hitsCount: cleanRetrieval.length,
      hits: cleanRetrieval.map((r) => ({
        id: r.id.toString(),
        score: r.score,
        kind: r.metadata?.kind,
        title: r.metadata?.title,
      })),
    },
  });

  /* 5. Compose the system message. */
  const systemContent = [
    SYSTEM_PROMPT,
    VOICE_RULES,
    `# Retrieved context\n\n${context}`,
  ]
    .filter((section) => section.length > 0)
    .join("\n\n---\n\n");

  /* 6. Stream chat completion. */
  let generation: ReturnType<NonNullable<typeof trace>["generation"]> | null = null;
  if (trace) {
    generation = trace.generation({
      name: "generate-response",
      model: modelClient.chatModel,
      input: [
        { role: "system", content: systemContent },
        { role: "user", content: userQuestion },
      ],
    });
  }

  try {
    const response = await modelClient.streamChat(
      [
        { role: "system", content: systemContent },
        { role: "user", content: userQuestion },
      ],
      req.signal,
    );

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      const newStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              const text = decoder.decode(value, { stream: true });
              accumulatedText += text;
              controller.enqueue(value);
            }
            controller.close();

            if (generation) {
              generation.end({
                output: accumulatedText,
              });
            }
            if (trace) {
              trace.update({
                output: accumulatedText,
              });
            }
            if (langfuse) {
              await langfuse.flushAsync();
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            if (generation) {
              generation.update({ level: "ERROR", statusMessage: errorMsg });
              generation.end();
            }
            if (trace) {
              trace.update({
                output: `Error: ${errorMsg}`,
              });
            }
            if (langfuse) {
              await langfuse.flushAsync();
            }
            controller.error(error);
          }
        },
        cancel() {
          reader.cancel();
        }
      });

      return new Response(newStream, {
        headers: response.headers,
      });
    }

    // Stream was not ok
    const statusMsg = `Response status: ${response.status}`;
    if (generation) {
      generation.update({ level: "ERROR", statusMessage: statusMsg });
      generation.end();
    }
    if (trace) {
      trace.update({
        output: `Error: ${statusMsg}`,
      });
    }
    if (langfuse) {
      await langfuse.flushAsync();
    }
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (generation) {
      generation.update({ level: "ERROR", statusMessage: errorMsg });
      generation.end();
    }
    if (trace) {
      trace.update({
        output: `Error: ${errorMsg}`,
      });
    }
    if (langfuse) {
      await langfuse.flushAsync();
    }
    throw error;
  }
}

function notConfigured(message: string): Response {
  return new Response(message, {
    status: 503,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function badRequest(message: string): Response {
  return new Response(message, {
    status: 400,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
