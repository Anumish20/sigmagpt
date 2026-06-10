import { API_BASE } from "./config";

/**
 * POST to an SSE endpoint and dispatch parsed events.
 * Uses fetch + a ReadableStream reader so we can send a JSON body
 * (EventSource only supports GET) and abort mid-stream.
 */
export interface ChatStreamHandlers {
  onToken?: (token: string) => void;
  onTitle?: (title: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

export async function streamChat(
  body: { conversationId: string; message: string; options?: Record<string, number> },
  handlers: ChatStreamHandlers,
  signal?: AbortSignal
) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    handlers.onError?.("Failed to reach the model server.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const lines = frame.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;

      try {
        const payload = JSON.parse(data);
        if (event === "token") handlers.onToken?.(payload.token);
        else if (event === "title") handlers.onTitle?.(payload.title);
        else if (event === "done") handlers.onDone?.();
        else if (event === "error") handlers.onError?.(payload.message);
      } catch {
        /* ignore malformed frame */
      }
    }
  }
}
