/**
 * lib/rag/command-map.ts
 *
 * Shared client/server map of the six hero-terminal command keys to their
 * default dynamic-mode question. The HeroTerminal client uses this to label
 * chips; the /api/rag route uses it as the question text when the client
 * did not supply its own.
 *
 * Keeping one source of truth avoids drift between the static-mode copy and
 * the dynamic-mode prompt the LLM sees.
 */

export const RAG_COMMAND_KEYS = [
  "whoami",
  "projects",
  "stack",
  "latest",
  "contact",
  "help",
] as const;

export type RagCommandKey = (typeof RAG_COMMAND_KEYS)[number];

export const RAG_COMMAND_LABEL: Record<RagCommandKey, string> = {
  whoami: "whoami",
  projects: "projects",
  stack: "stack",
  latest: "latest",
  contact: "contact",
  help: "help",
};

export const RAG_COMMAND_QUESTION: Record<RagCommandKey, string> = {
  whoami:
    "Summarize who Mahboob Alam is, what he is building right now, and what kind of roles fit him.",
  projects:
    "What are Mahboob's most relevant backend and platform projects?",
  stack:
    "What technologies has Mahboob used in real projects, and where?",
  latest:
    "What is Mahboob currently building or writing about?",
  contact:
    "How can someone contact Mahboob and what should they contact him for?",
  help:
    "Explain what this portfolio terminal can answer.",
};

export function isRagCommand(value: unknown): value is RagCommandKey | "custom" {
  if (value === "custom") return true;
  return (
    typeof value === "string" &&
    (RAG_COMMAND_KEYS as readonly string[]).includes(value)
  );
}

export function questionForCommand(command: RagCommandKey): string {
  return RAG_COMMAND_QUESTION[command];
}

export const RAG_REJECTION_MESSAGE =
  "I can only answer questions related to my software engineering work, projects, and portfolio. For other inquiries, please reach out via /lets-connect.";

export function isPotentialPromptInjection(query: string): boolean {
  const q = query.toLowerCase();

  // Direct requests for instructions or prompts
  const matchesPromptRequest =
    q.includes("system prompt") ||
    q.includes("system instruction") ||
    q.includes("system message") ||
    q.includes("initial prompt") ||
    q.includes("hidden prompt") ||
    q.includes("corpus/system-prompt") ||
    q.includes("voice.md") ||
    q.includes("system-prompt.md") ||
    q.includes("prompt-guide") ||
    q.includes("private-boundaries") ||
    q.includes("rag-management") ||
    q.includes("your instructions") ||
    q.includes("your rules") ||
    q.includes("voice rules") ||
    q.includes("writing rules") ||
    q.includes("give me your prompt") ||
    q.includes("reveal your prompt") ||
    q.includes("what are your instructions") ||
    q.includes("how are you programmed") ||
    q.includes("system instructions") ||
    q.includes("system guidelines");

  // Bypassing / jailbreak attempts
  const matchesJailbreak =
    q.includes("ignore previous instructions") ||
    q.includes("ignore the instructions") ||
    q.includes("ignore all instructions") ||
    q.includes("bypass safety") ||
    q.includes("jailbreak") ||
    q.includes("pretend to be") ||
    q.includes("you are now a") ||
    q.includes("switch roles") ||
    q.includes("developer mode") ||
    q.includes("ignore the rules") ||
    /ignore\s+(?:previous|above|the\s+rules|instructions)/i.test(q) ||
    /give\s+me\s+(?:instructions|rules|the\s+prompt|your\s+prompt)/i.test(q) ||
    /reveal\s+(?:instructions|rules|the\s+prompt|your\s+prompt)/i.test(q);

  return matchesPromptRequest || matchesJailbreak;
}