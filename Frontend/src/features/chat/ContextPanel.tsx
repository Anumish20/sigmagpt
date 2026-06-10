import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";
import { X, SlidersHorizontal, MessageSquareText, Thermometer } from "lucide-react";
import { useUI } from "@/stores/ui.store";
import { useConversations, useUpdateConversation } from "@/features/conversations/hooks";
import { Button } from "@/components/ui/Button";

export function ContextPanel() {
  const open = useUI((s) => s.contextPanelOpen);
  const toggle = useUI((s) => s.toggleContextPanel);
  const activeId = useUI((s) => s.activeId);
  const temperature = useUI((s) => s.temperature);
  const setTemperature = useUI((s) => s.setTemperature);

  const { data: conversations = [] } = useConversations();
  const update = useUpdateConversation();
  const conv = conversations.find((c) => c.id === activeId);

  const [prompt, setPrompt] = useState("");
  useEffect(() => setPrompt(conv?.systemPrompt ?? ""), [conv?.id, conv?.systemPrompt]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="hidden h-full shrink-0 overflow-hidden border-l border-line bg-surface lg:block"
        >
          <div className="flex h-full w-[340px] flex-col">
            <header className="flex h-14 items-center gap-2 border-b border-line px-4">
              <SlidersHorizontal className="size-4 text-violet-400" />
              <span className="text-sm font-semibold text-ink-hi">Configuration</span>
              <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={toggle}>
                <X className="size-4" />
              </Button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-4">
              {/* system prompt */}
              <Field icon={<MessageSquareText className="size-3.5" />} label="System prompt">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onBlur={() =>
                    conv && prompt !== conv.systemPrompt &&
                    update.mutate({ id: conv.id, patch: { systemPrompt: prompt } })
                  }
                  disabled={!conv}
                  placeholder={conv ? "Give the assistant a persona or rules…" : "Start a chat first"}
                  rows={5}
                  className="w-full resize-none rounded-lg border border-line bg-base/60 p-3 text-sm text-ink-hi outline-none ring-1 ring-transparent transition focus:ring-violet-500/40 placeholder:text-ink-faint disabled:opacity-50"
                />
              </Field>

              {/* temperature */}
              <Field icon={<Thermometer className="size-3.5" />} label="Temperature">
                <div className="flex items-center gap-3">
                  <Slider.Root
                    value={[temperature]}
                    onValueChange={([v]) => setTemperature(v)}
                    min={0}
                    max={1.5}
                    step={0.1}
                    className="relative flex h-5 flex-1 items-center"
                  >
                    <Slider.Track className="relative h-1 grow rounded-full bg-white/10">
                      <Slider.Range className="absolute h-full rounded-full bg-brand" />
                    </Slider.Track>
                    <Slider.Thumb className="block size-4 rounded-full bg-white shadow-glow-sm outline-none" />
                  </Slider.Root>
                  <span className="w-9 text-right font-mono text-sm text-ink-hi">
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-ink-faint">
                  Lower is focused & deterministic. Higher is creative.
                </p>
              </Field>

              {/* usage */}
              {conv && (
                <Field label="Conversation">
                  <dl className="space-y-1.5 text-sm">
                    <Row k="Messages" v={String(conv.messageCount)} />
                    <Row k="Model" v={conv.model} />
                    <Row
                      k="Created"
                      v={new Date(conv.createdAt).toLocaleDateString()}
                    />
                  </dl>
                </Field>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-lo">{k}</dt>
      <dd className="text-ink-hi">{v}</dd>
    </div>
  );
}
