export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  status?: "complete" | "streaming" | "error";
  createdAt?: string;
  /** client-only: marks a message that is mid-stream */
  pending?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  titleAuto: boolean;
  model: string;
  systemPrompt: string;
  pinned: boolean;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface OllamaModel {
  name: string;
  size?: number;
  family?: string;
  parameterSize?: string;
}
