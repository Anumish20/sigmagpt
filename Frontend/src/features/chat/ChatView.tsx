import { useEffect, useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { PanelLeft, ChevronDown, PanelRight, Check, Cpu } from "lucide-react";
import { useUI } from "@/stores/ui.store";
import { useChat } from "./hooks/useChat";
import { useModels } from "@/features/conversations/hooks";
import { UserMessage, AssistantMessage } from "./Message";
import { Composer } from "@/features/composer/Composer";
import { Welcome } from "@/features/landing/Welcome";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";

export function ChatView() {
  const sidebarOpen = useUI((s) => s.sidebarOpen);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const toggleContextPanel = useUI((s) => s.toggleContextPanel);

  const { messages, isStreaming, send, stop } = useChat();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const empty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* ---- header ---- */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-3">
        {!sidebarOpen && (
          <Tooltip content="Open sidebar" kbd="⌘B">
            <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
              <PanelLeft className="size-4" />
            </Button>
          </Tooltip>
        )}

        <ModelSwitcher />

        <div className="ml-auto">
          <Tooltip content="Toggle panel" kbd="⌘.">
            <Button variant="ghost" size="icon-sm" onClick={toggleContextPanel}>
              <PanelRight className="size-4" />
            </Button>
          </Tooltip>
        </div>
      </header>

      {/* ---- messages / welcome ---- */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        {empty ? (
          <Welcome onPick={(t) => send(t)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-7 px-4 pb-44 pt-8">
            {messages.map((m) =>
              m.role === "user" ? (
                <UserMessage key={m.id} content={m.content} />
              ) : (
                <AssistantMessage key={m.id} message={m} />
              )
            )}
            <div ref={bottomRef} className="h-px" />
          </div>
        )}
      </div>

      {/* ---- composer ---- */}
      <Composer
        onSend={send}
        onStop={stop}
        isStreaming={isStreaming}
        value={draft}
        setValue={setDraft}
      />
    </div>
  );
}

function ModelSwitcher() {
  const model = useUI((s) => s.model);
  const setModel = useUI((s) => s.setModel);
  const { data } = useModels();
  const models = data?.models ?? [];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-hi transition hover:bg-hover">
          <Cpu className="size-4 text-violet-400" />
          {model}
          <ChevronDown className="size-3.5 text-ink-lo" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="glass z-50 min-w-[220px] rounded-xl p-1.5 shadow-e2 data-[state=open]:animate-fade-up"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Installed models
          </div>
          {models.length === 0 && (
            <div className="px-2.5 py-2 text-sm text-ink-lo">No models found</div>
          )}
          {models.map((m) => (
            <DropdownMenu.Item
              key={m.name}
              onSelect={() => setModel(m.name.replace(/:latest$/, ""))}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink outline-none transition data-[highlighted]:bg-hover data-[highlighted]:text-ink-hi"
            >
              <Cpu className="size-4 text-ink-faint" />
              <span className="flex-1">{m.name}</span>
              {m.parameterSize && (
                <span className="text-[11px] text-ink-faint">{m.parameterSize}</span>
              )}
              {model === m.name.replace(/:latest$/, "") && (
                <Check className="size-3.5 text-violet-400" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
