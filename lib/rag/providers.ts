import OpenAI from "openai";
import { env } from "@/lib/env";

export type LlmProvider = "fireworks" | "gemini" | "groq" | "openai";

export type RagChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface RagModelClient {
  provider: LlmProvider;
  chatModel: string;
  streamChat(
    messages: RagChatMessage[],
    signal?: AbortSignal,
  ): Promise<Response>;
}

// Note: embeddings are owned by Upstash Vector (server-side) and are not
// produced by any provider SDK in this codebase. The previous `embed()`
// method on `RagModelClient` was removed when the design pivoted to
// server-side embedding. If a future provider needs to produce embeddings
// client-side, re-introduce it here and add an explicit embed path in
// `scripts/rag-reindex.ts` and `app/api/rag/route.ts`.

type ProviderConfig = {
  apiKeyEnv: string;
  baseURL: string;
  defaultChatModel: string;
};

const OPENAI_COMPATIBLE_PROVIDERS = {
  fireworks: {
    apiKeyEnv: "FIREWORKS_API_KEY",
    baseURL: "https://api.fireworks.ai/inference/v1",
    defaultChatModel: "accounts/fireworks/models/gpt-oss-120b",
  },
  groq: {
    apiKeyEnv: "GROQ_API_KEY",
    baseURL: "https://api.groq.com/openai/v1",
    defaultChatModel: "llama-3.3-70b-versatile",
  },
  openai: {
    apiKeyEnv: "OPENAI_API_KEY",
    baseURL: "https://api.openai.com/v1",
    defaultChatModel: "gpt-4.1-mini",
  },
} satisfies Partial<Record<LlmProvider, ProviderConfig>>;

const GEMINI_API_KEY_ENV = "GEMINI_API_KEY";

export class RagProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RagProviderConfigurationError";
  }
}

export function getConfiguredProvider(): LlmProvider {
  const raw = env.optional("LLM_PROVIDER", "fireworks").toLowerCase();
  if (isLlmProvider(raw)) return raw;
  throw new RagProviderConfigurationError(
    `Unsupported LLM_PROVIDER "${raw}". Use fireworks, gemini, groq, or openai.`,
  );
}

export function getRagModelClient(): RagModelClient {
  const provider = getConfiguredProvider();
  if (provider === "gemini") {
    env.required(GEMINI_API_KEY_ENV);
    throw new RagProviderConfigurationError(
      "LLM_PROVIDER=gemini is recognized, but the Gemini adapter is not implemented yet.",
    );
  }
  return createOpenAICompatibleClient(provider);
}

function createOpenAICompatibleClient(
  provider: keyof typeof OPENAI_COMPATIBLE_PROVIDERS,
): RagModelClient {
  const config = OPENAI_COMPATIBLE_PROVIDERS[provider];
  const apiKey = env.required(config.apiKeyEnv);
  const baseURL = env.optional("RAG_OPENAI_COMPAT_BASE_URL", config.baseURL);
  const chatModel = env.optional("RAG_CHAT_MODEL", config.defaultChatModel);

  const client = new OpenAI({
    apiKey,
    baseURL,
    maxRetries: 3,
    timeout: 60_000,
  });

  return {
    provider,
    chatModel,
    async streamChat(
      messages: RagChatMessage[],
      signal?: AbortSignal,
    ): Promise<Response> {
      const stream = await client.chat.completions.create(
        {
          model: chatModel,
          messages,
          stream: true,
          temperature: 0.2,
          max_tokens: 500,
        },
        { signal },
      );

      const encoder = new TextEncoder();
      const body = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const part of stream) {
              const text = part.choices[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
        cancel() {
          void stream.controller.abort();
        },
      });

      return new Response(body, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    },
  };
}

function isLlmProvider(value: string): value is LlmProvider {
  return (
    value === "fireworks" ||
    value === "gemini" ||
    value === "groq" ||
    value === "openai"
  );
}
