# RAG Provider Contract

**Default provider:** `fireworks`
**Primary goal:** Keep the RAG implementation provider-switchable by changing
environment variables, not application logic.

The dynamic terminal should support this top-level toggle:

```txt
LLM_PROVIDER=fireworks
```

Supported planned values:

```txt
fireworks
gemini
groq
openai
```

The first implementation should ship `fireworks` first because Mahboob has
available Fireworks credits. Other providers can be added behind the same
contract later.

## Env Var Convention

When `LLM_PROVIDER` is set, the runtime expects the matching provider key:

| `LLM_PROVIDER` | Required key |
|---|---|
| `fireworks` | `FIREWORKS_API_KEY` |
| `gemini` | `GEMINI_API_KEY` |
| `groq` | `GROQ_API_KEY` |
| `openai` | `OPENAI_API_KEY` |

Vector storage remains separate:

```txt
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
```

## Fireworks Defaults

Use Fireworks through its OpenAI-compatible API.

```txt
LLM_PROVIDER=fireworks
FIREWORKS_API_KEY=
RAG_CHAT_MODEL=accounts/fireworks/models/gpt-oss-120b
RAG_EMBEDDING_MODEL=accounts/fireworks/models/qwen3-embedding-8b
RAG_OPENAI_COMPAT_BASE_URL=https://api.fireworks.ai/inference/v1
```

The Fireworks docs also show `fireworks/qwen3-embedding-8b` as an embedding
model name. Mahboob's requested value is
`accounts/fireworks/models/qwen3-embedding-8b`; use that first. If Fireworks
returns `404`, switch only `RAG_EMBEDDING_MODEL` to
`fireworks/qwen3-embedding-8b` and document the change in progress.

## Provider Interface

Later code should hide provider details behind a small interface:

```ts
export type LlmProvider = "fireworks" | "gemini" | "groq" | "openai";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type EmbeddingResult = {
  embedding: number[];
  dimensions: number;
  model: string;
};

export interface RagModelClient {
  provider: LlmProvider;
  chatModel: string;
  embeddingModel: string;
  embed(input: string): Promise<EmbeddingResult>;
  streamChat(messages: ChatMessage[], signal?: AbortSignal): Promise<Response>;
}
```

The API route should call `getRagModelClient()` and never instantiate provider
SDKs directly.

## OpenAI-Compatible Providers

Fireworks, Groq, and OpenAI can share an OpenAI-compatible client path:

```ts
const OPENAI_COMPAT_PROVIDERS = {
  fireworks: {
    apiKeyEnv: "FIREWORKS_API_KEY",
    baseURL: "https://api.fireworks.ai/inference/v1",
    chatModel: "accounts/fireworks/models/gpt-oss-120b",
    embeddingModel: "accounts/fireworks/models/qwen3-embedding-8b",
  },
  groq: {
    apiKeyEnv: "GROQ_API_KEY",
    baseURL: "https://api.groq.com/openai/v1",
    chatModel: "llama-3.3-70b-versatile",
    embeddingModel: "",
  },
  openai: {
    apiKeyEnv: "OPENAI_API_KEY",
    baseURL: "https://api.openai.com/v1",
    chatModel: "gpt-4.1-mini",
    embeddingModel: "text-embedding-3-small",
  },
} as const;
```

`groq` currently has no default embedding model in this plan. If `groq` is used
for chat later, pair it with another embedding provider or add a Groq-supported
embedding model if available.

## Fireworks Chat Example

Fireworks supports the OpenAI Chat Completions API:

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY,
  baseURL: "https://api.fireworks.ai/inference/v1",
  maxRetries: 3,
  timeout: 60_000,
});

const response = await client.chat.completions.create({
  model: "accounts/fireworks/models/gpt-oss-120b",
  messages: [
    { role: "system", content: "Answer only from the provided context." },
    { role: "user", content: "What should I look at first?" },
  ],
  stream: true,
});
```

## Fireworks Embedding Example

Fireworks embeddings use the OpenAI-compatible embeddings endpoint:

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY,
  baseURL: "https://api.fireworks.ai/inference/v1",
  maxRetries: 3,
  timeout: 60_000,
});

const response = await client.embeddings.create({
  model: "accounts/fireworks/models/qwen3-embedding-8b",
  input: "Taply is a digital business card platform with NFC and QR sharing.",
});

const embedding = response.data[0]?.embedding;
```

## Reasoning And Thinking

Do not enable Fireworks reasoning or thinking parameters for this terminal.

The attached Fireworks reasoning docs describe `reasoning_content`,
`reasoning_effort`, and `thinking`, but this portfolio terminal does not need
chain-of-thought or reasoning traces. The RAG route should omit all reasoning
parameters and stream only final answer text.

## Timeout And Retry Rules

For interactive terminal usage:

- Timeout: 30-60 seconds.
- Retries: use the OpenAI SDK built-in `maxRetries: 3`.
- Retryable statuses: `429`, `500`, `502`, `503`, `504`.
- Non-retryable statuses: `400`, `401`, `404`, `422`.

The client should abort the request when the visitor clears output, switches
modes, or navigates away.
