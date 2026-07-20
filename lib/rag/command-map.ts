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