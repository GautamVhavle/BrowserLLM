import type { Message } from "../types";

const CHARS_PER_TOKEN = 4;
/** Room left so a condensed memory still fits beside the live turns. */
const MEMORY_RESERVE = 180;

export const BASE_SYSTEM_PROMPT =
  "You are a helpful, friendly AI assistant running locally in the user's browser. Keep responses concise and helpful.";

export function systemContent(summary: string | null): string {
  if (!summary) return BASE_SYSTEM_PROMPT;
  return `${BASE_SYSTEM_PROMPT}\n\nEarlier conversation, condensed:\n${summary}`;
}

export function summaryRequest(previous: string, turns: Message[]): string {
  const lines = turns
    .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
    .join("\n");
  const prior = previous ? `Previous memory:\n${previous}\n\n` : "";
  return `${prior}New turns:\n${lines}`;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function isErrorMessage(message: Message): boolean {
  return message.role === "assistant" && (message.error === true || message.content.startsWith("Error: "));
}

/**
 * Keep the newest turns that fit in the context window.
 * A single over-long message is kept as-is; splitting it would change what the user said.
 */
export function trimHistory(
  messages: Message[],
  contextWindow: number,
  reservedTokens: number,
): Message[] {
  const budget = Math.max(256, contextWindow - reservedTokens);
  const kept: Message[] = [];
  let used = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (isErrorMessage(message)) continue;
    const cost = estimateTokens(message.content) + 4;
    if (used + cost > budget && kept.length > 0) break;
    kept.push(message);
    used += cost;
  }

  kept.reverse();
  while (kept.length > 1 && kept[0]?.role === "assistant") kept.shift();
  return kept;
}

/** Completion budget that still leaves room for the prompt on small windows. */
export function completionBudget(contextWindow: number): number {
  return Math.min(1024, Math.max(128, Math.floor(contextWindow / 4)));
}

export interface ContextPlan {
  /** Messages from the start of the thread represented by the memory. */
  foldCount: number;
  /** Turns sent after the memory. This suffix stays put until the next fold. */
  recent: Message[];
  needsFold: boolean;
}

function promptTokens(message: Message): number {
  return estimateTokens(message.content) + 4;
}

function withoutErrors(messages: Message[], start: number): Message[] {
  const kept: Message[] = [];
  for (let i = start; i < messages.length; i++) {
    if (!isErrorMessage(messages[i])) kept.push(messages[i]);
  }
  return kept;
}

function dropLeadingAssistant(messages: Message[]): Message[] {
  const copy = [...messages];
  while (copy.length > 1 && copy[0]?.role === "assistant") copy.shift();
  return copy;
}

/**
 * Decide which prefix is already (or must become) memory, and which suffix
 * is sent verbatim. A covered prefix is never unfolded: that would change
 * the prompt WebLLM has cached.
 */
export function planContext(
  messages: Message[],
  coveredCount: number,
  contextWindow: number,
  reservedTokens: number,
): ContextPlan {
  const covered = Math.max(0, Math.min(Math.floor(coveredCount), messages.length));
  const replyBudget = Math.max(128, contextWindow - reservedTokens);
  const tail = withoutErrors(messages, covered);
  const tailCost = tail.reduce((sum, message) => sum + promptTokens(message), 0);

  if (tailCost <= replyBudget) {
    // Keep every turn that still fits. Dropping a leading assistant here
    // would remove it from the prompt without adding it to the memory.
    return { foldCount: covered, recent: tail, needsFold: false };
  }

  const tight = Math.max(128, replyBudget - MEMORY_RESERVE);
  const kept: number[] = [];
  let used = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (isErrorMessage(messages[i])) continue;
    const cost = promptTokens(messages[i]);
    if (used + cost > tight && kept.length > 0) break;
    kept.push(i);
    used += cost;
  }
  kept.reverse();
  while (kept.length > 1 && messages[kept[0]]?.role === "assistant") kept.shift();

  const foldCount = Math.max(covered, kept.length > 0 ? kept[0] : messages.length);
  return {
    foldCount,
    recent: dropLeadingAssistant(withoutErrors(messages, foldCount)),
    needsFold: foldCount > covered,
  };
}

/** Oldest not-yet-covered turns that fit in one summary call. */
export function takeSummaryChunk(
  messages: Message[],
  start: number,
  end: number,
  maxTokens: number,
): { messages: Message[]; next: number } {
  const taken: Message[] = [];
  let used = 0;
  let i = Math.max(0, start);
  const stop = Math.min(messages.length, end);
  for (; i < stop; i++) {
    const message = messages[i];
    if (isErrorMessage(message)) continue;
    const cost = promptTokens(message);
    if (used + cost > maxTokens && taken.length > 0) break;
    taken.push(message);
    used += cost;
  }
  return { messages: taken, next: i };
}
