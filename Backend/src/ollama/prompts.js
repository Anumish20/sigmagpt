export const DEFAULT_SYSTEM_PROMPT =
  "You are SigmaGPT, a sharp, fast, privacy-first AI assistant running locally. " +
  "Be concise and direct. Reply in plain Markdown. Use fenced code blocks ONLY for " +
  "actual code (with a language tag), plus lists and tables where they help. " +
  "NEVER wrap your whole answer in a code block or a ```markdown fence. " +
  "Prefer clarity over filler.";

// Rough token estimate (~4 chars/token) — good enough for windowing a small model.
const estimateTokens = (text = "") => Math.ceil(text.length / 4);

/**
 * Build the message array for Ollama's /api/chat, keeping the most recent
 * turns within a token budget and always prepending the system prompt.
 */
export function buildContext(history, systemPrompt, budget = 3000) {
  const system = (systemPrompt || DEFAULT_SYSTEM_PROMPT).trim();
  const messages = [];
  let used = estimateTokens(system);

  // walk newest -> oldest, stop when budget is exhausted
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    const cost = estimateTokens(m.content);
    if (used + cost > budget && messages.length > 0) break;
    used += cost;
    messages.unshift({ role: m.role, content: m.content });
  }

  return [{ role: "system", content: system }, ...messages];
}

export const TITLE_PROMPT =
  "Summarize this conversation as a short, specific title of 3-6 words. " +
  "Return ONLY the title, no quotes, no punctuation at the end.";
