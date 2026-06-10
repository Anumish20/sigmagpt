import { useState } from "react";
import { motion } from "framer-motion";
import { Pin, PinOff, Trash2, MessageSquare, Check, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Conversation } from "@/types";
import { useUpdateConversation, useDeleteConversation } from "./hooks";

interface Props {
  conv: Conversation;
  active: boolean;
  onSelect: () => void;
}

export function ConversationItem({ conv, active, onSelect }: Props) {
  const update = useUpdateConversation();
  const del = useDeleteConversation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conv.title);

  const commit = () => {
    const t = draft.trim();
    if (t && t !== conv.title) update.mutate({ id: conv.id, patch: { title: t } });
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      onDoubleClick={() => {
        setDraft(conv.title);
        setEditing(true);
      }}
      className={cn(
        "group relative flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
        active ? "bg-hover text-ink-hi" : "text-ink hover:bg-white/[0.04] hover:text-ink-hi"
      )}
    >
      {active && (
        <motion.span
          layoutId="active-rail"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand"
        />
      )}

      <MessageSquare className="size-3.5 shrink-0 text-ink-faint" strokeWidth={2} />

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="min-w-0 flex-1 rounded bg-base px-1.5 py-0.5 text-sm text-ink-hi outline-none ring-1 ring-violet-500/50"
        />
      ) : (
        <span className="min-w-0 flex-1 truncate">{conv.title || "New chat"}</span>
      )}

      {/* hover actions */}
      {!editing && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            title={conv.pinned ? "Unpin" : "Pin"}
            onClick={(e) => {
              e.stopPropagation();
              update.mutate({ id: conv.id, patch: { pinned: !conv.pinned } });
            }}
            className="grid size-6 place-items-center rounded text-ink-lo hover:bg-white/10 hover:text-ink-hi"
          >
            {conv.pinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
          </button>
          <button
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              del.mutate(conv.id);
            }}
            className="grid size-6 place-items-center rounded text-ink-lo hover:bg-danger/15 hover:text-danger"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}

      {conv.pinned && !editing && (
        <Pin className="size-3 shrink-0 text-violet-400 group-hover:hidden" />
      )}
    </motion.div>
  );
}

// re-export icons used elsewhere to keep imports tidy
export { Check, X };
