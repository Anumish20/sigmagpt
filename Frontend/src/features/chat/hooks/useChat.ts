import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { streamChat } from "@/lib/sse";
import { useUI } from "@/stores/ui.store";
import { useMessages } from "@/features/conversations/hooks";
import type { Conversation, Message } from "@/types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function useChat() {
  const activeId = useUI((s) => s.activeId);
  const setActiveId = useUI((s) => s.setActiveId);
  const model = useUI((s) => s.model);
  const temperature = useUI((s) => s.temperature);
  const qc = useQueryClient();

  const { data: serverMessages } = useMessages(activeId);
  const [streamMsgs, setStreamMsgs] = useState<Message[] | null>(null);
  const [isStreaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const messages: Message[] = streamMsgs ?? serverMessages ?? [];

  // when we're idle, defer to server truth (clears the streaming overlay)
  useEffect(() => {
    if (!isStreaming) setStreamMsgs(null);
  }, [activeId, serverMessages, isStreaming]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    // Optimistic: render the user's message + a thinking bubble immediately,
    // BEFORE any network call, so there is always instant visual feedback.
    const base = streamMsgs ?? serverMessages ?? [];
    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const aiMsg: Message = { id: uid(), role: "assistant", content: "", pending: true };
    setStreamMsgs([...base, userMsg, aiMsg]);
    setStreaming(true);

    const ac = new AbortController();
    abortRef.current = ac;

    const setLast = (patch: Partial<Message>) =>
      setStreamMsgs((cur) =>
        cur ? cur.map((m, i) => (i === cur.length - 1 ? { ...m, ...patch } : m)) : cur
      );
    const appendToken = (tok: string) =>
      setStreamMsgs((cur) =>
        cur ? cur.map((m, i) => (i === cur.length - 1 ? { ...m, content: m.content + tok } : m)) : cur
      );

    let id = activeId;
    try {
      if (!id) {
        const conv = await api.createConversation({ model });
        id = conv.id;
        setActiveId(id);
        qc.setQueryData<Conversation[]>(["conversations"], (old) => [conv, ...(old ?? [])]);
      }

      await streamChat(
        { conversationId: id, message: trimmed, options: { temperature } },
        {
          onToken: appendToken,
          onTitle: (title) =>
            qc.setQueryData<Conversation[]>(["conversations"], (old) =>
              (old ?? []).map((c) => (c.id === id ? { ...c, title, titleAuto: true } : c))
            ),
          onError: (msg) => setLast({ content: msg, status: "error", pending: false }),
        },
        ac.signal
      );
    } catch {
      if (!ac.signal.aborted) {
        setLast({
          content:
            "⚠️ Couldn't reach the SigmaGPT backend. Make sure it's running on http://localhost:8080 (run `npm run dev`).",
          status: "error",
          pending: false,
        });
      }
    }

    setStreaming(false);
    abortRef.current = null;
    setLast({ pending: false });
    if (id) {
      qc.invalidateQueries({ queryKey: ["messages", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  return { messages, isStreaming, send, stop, activeId };
}
