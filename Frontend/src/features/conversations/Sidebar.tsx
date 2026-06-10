import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PanelLeftClose, Plus, Search, Settings, Pin } from "lucide-react";
import { SigmaMark } from "@/components/brand/SigmaMark";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useUI } from "@/stores/ui.store";
import { useConversations, useHealth } from "./hooks";
import { ConversationItem } from "./ConversationItem";
import { groupByDate } from "@/lib/format";

export function Sidebar() {
  const activeId = useUI((s) => s.activeId);
  const setActiveId = useUI((s) => s.setActiveId);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const setSettingsOpen = useUI((s) => s.setSettingsOpen);
  const setCommandOpen = useUI((s) => s.setCommandOpen);

  const { data: conversations = [] } = useConversations();
  const { data: health } = useHealth();
  const [q, setQ] = useState("");

  const { pinned, groups } = useMemo(() => {
    const filtered = conversations.filter((c) =>
      (c.title || "New chat").toLowerCase().includes(q.toLowerCase())
    );
    return {
      pinned: filtered.filter((c) => c.pinned),
      groups: groupByDate(filtered.filter((c) => !c.pinned)),
    };
  }, [conversations, q]);

  return (
    <aside className="flex h-full w-72 flex-col border-r border-line bg-surface">
      {/* ---- workspace header ---- */}
      <div className="flex items-center gap-2.5 px-3 pt-3.5">
        <SigmaMark size={30} />
        <div className="flex flex-1 flex-col leading-tight">
          <span className="text-sm font-semibold text-ink-hi">SigmaGPT</span>
          <span className="flex items-center gap-1.5 text-[11px] text-ink-faint">
            <span
              className={`size-1.5 rounded-full ${
                health?.ollama.reachable ? "bg-success" : "bg-danger"
              }`}
            />
            {health?.ollama.reachable ? "Local · Online" : "Ollama offline"}
          </span>
        </div>
        <Tooltip content="Collapse sidebar" kbd="⌘B">
          <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
            <PanelLeftClose className="size-4" />
          </Button>
        </Tooltip>
      </div>

      {/* ---- new chat + search ---- */}
      <div className="flex flex-col gap-2 p-3">
        <Button variant="brand" size="md" className="justify-start" onClick={() => setActiveId(null)}>
          <Plus className="size-4" />
          New chat
          <kbd className="ml-auto rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px]">⌘N</kbd>
        </Button>

        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2.5 rounded-md border border-line bg-base/60 px-3 py-2 text-left text-sm text-ink-lo transition-colors hover:border-line-hi hover:text-ink"
        >
          <Search className="size-3.5" />
          <span className="flex-1">Search chats…</span>
          <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter…"
            className="w-full rounded-md bg-white/[0.03] py-1.5 pl-8 pr-3 text-sm text-ink-hi outline-none ring-1 ring-transparent transition focus:ring-violet-500/40 placeholder:text-ink-faint"
          />
        </div>
      </div>

      {/* ---- list ---- */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {pinned.length > 0 && (
          <Section label="Pinned" icon={<Pin className="size-3" />}>
            <AnimatePresence initial={false}>
              {pinned.map((c) => (
                <ConversationItem
                  key={c.id}
                  conv={c}
                  active={c.id === activeId}
                  onSelect={() => setActiveId(c.id)}
                />
              ))}
            </AnimatePresence>
          </Section>
        )}

        {groups.map((group) => (
          <Section key={group.label} label={group.label}>
            <AnimatePresence initial={false}>
              {group.items.map((c) => (
                <ConversationItem
                  key={c.id}
                  conv={c}
                  active={c.id === activeId}
                  onSelect={() => setActiveId(c.id)}
                />
              ))}
            </AnimatePresence>
          </Section>
        ))}

        {conversations.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-ink-faint">
            No conversations yet.
            <br />
            Start one below.
          </p>
        )}
      </div>

      {/* ---- footer ---- */}
      <div className="border-t border-line p-3">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-hover"
        >
          <div className="grid size-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">
            S
          </div>
          <div className="flex flex-1 flex-col leading-tight">
            <span className="text-sm font-medium text-ink-hi">Local Workspace</span>
            <span className="text-[11px] text-ink-faint">Ollama · {health?.defaultModel ?? "phi3"}</span>
          </div>
          <Settings className="size-4 text-ink-lo" />
        </button>
      </div>
    </aside>
  );
}

function Section({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1.5">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {icon}
        {label}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
