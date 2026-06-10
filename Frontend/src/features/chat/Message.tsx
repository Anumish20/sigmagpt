import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, RotateCcw } from "lucide-react";
import { SigmaMark } from "@/components/brand/SigmaMark";
import { Markdown } from "./Markdown";
import { cn } from "@/lib/cn";
import type { Message } from "@/types";

export function UserMessage({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-end"
    >
      <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-raised px-4 py-2.5 text-ink-hi shadow-e1">
        {content}
      </div>
    </motion.div>
  );
}

export function AssistantMessage({
  message,
  onRegenerate,
}: {
  message: Message;
  onRegenerate?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isError = message.status === "error";
  const streaming = message.pending && message.content.length === 0;

  const copy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="group flex gap-3.5"
    >
      <div className="relative mt-0.5 shrink-0">
        <SigmaMark size={30} />
        {message.pending && (
          <span className="absolute -inset-0.5 -z-10 animate-pulse rounded-lg bg-violet-500/30 blur-md" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {streaming ? (
          <ThinkingState />
        ) : (
          <div className={cn(isError && "text-danger")}>
            <Markdown content={message.content} />
            {message.pending && (
              <span className="ml-0.5 inline-block h-4 w-[3px] -translate-y-0.5 animate-caret-blink rounded-full bg-violet-400 align-middle" />
            )}
          </div>
        )}

        {/* actions */}
        {!message.pending && !isError && (
          <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <ActionBtn onClick={copy} active={copied}>
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </ActionBtn>
            {onRegenerate && (
              <ActionBtn onClick={onRegenerate}>
                <RotateCcw className="size-3.5" />
                Regenerate
              </ActionBtn>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ActionBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-lo transition hover:bg-hover hover:text-ink-hi"
    >
      {children}
    </button>
  );
}

export function ThinkingState() {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-violet-400"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
          />
        ))}
      </div>
      <span className="text-sm text-ink-lo">Thinking…</span>
    </div>
  );
}
