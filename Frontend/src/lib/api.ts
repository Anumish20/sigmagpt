import type { Conversation, Message, OllamaModel } from "@/types";
import { API_BASE as BASE } from "./config";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  listConversations: () =>
    req<{ conversations: Conversation[] }>("/conversations").then((r) => r.conversations),

  createConversation: (body?: { title?: string; model?: string; systemPrompt?: string }) =>
    req<Conversation>("/conversations", { method: "POST", body: JSON.stringify(body ?? {}) }),

  getMessages: (id: string) =>
    req<{ messages: Message[] }>(`/conversations/${id}/messages`).then((r) => r.messages),

  updateConversation: (id: string, patch: Partial<Pick<Conversation, "title" | "pinned" | "systemPrompt" | "model">>) =>
    req<Conversation>(`/conversations/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  deleteConversation: (id: string) =>
    req<{ success: boolean }>(`/conversations/${id}`, { method: "DELETE" }),

  getModels: () =>
    req<{ models: OllamaModel[]; default: string }>("/models"),

  getHealth: () =>
    req<{ status: string; ollama: { reachable: boolean; version?: string }; defaultModel: string }>(
      "/health"
    ),
};
