import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Square, Mic, Sparkles, Command } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/Tooltip";

const TEMPLATES = [
  { label: "Summarize", text: "Summarize the following in 5 bullet points:\n\n" },
  { label: "Explain", text: "Explain this concept simply, with an analogy:\n\n" },
  { label: "Improve writing", text: "Improve the clarity and tone of this text:\n\n" },
  { label: "Code review", text: "Review this code for bugs and improvements:\n\n" },
];

interface Props {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  value: string;
  setValue: (v: string) => void;
}

export function Composer({ onSend, onStop, isStreaming, value, setValue }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [listening, setListening] = useState(false);

  // autoresize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  }, [value]);

  const submit = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue("");
  };

  // Web Speech API dictation (graceful if unsupported)
  const toggleVoice = () => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => setValue((value ? value + " " : "") + e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-4 pb-5">
      <div className="pointer-events-auto w-full max-w-3xl">
        {/* template chips */}
        <AnimatePresence>
          {templatesOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-2 flex flex-wrap gap-1.5"
            >
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    setValue(t.text);
                    setTemplatesOpen(false);
                    ref.current?.focus();
                  }}
                  className="rounded-full border border-line-hi bg-surface px-3 py-1 text-xs text-ink transition hover:border-violet-500/40 hover:text-ink-hi"
                >
                  {t.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className={cn(
            "glass flex items-end gap-2 rounded-2xl p-2 pl-3 shadow-e3 transition-shadow",
            "focus-within:shadow-glow"
          )}
        >
          <div className="flex items-center gap-0.5 pb-1">
            <Tooltip content="Templates">
              <button
                onClick={() => setTemplatesOpen((v) => !v)}
                className={cn(
                  "grid size-8 place-items-center rounded-lg text-ink-lo transition hover:bg-white/10 hover:text-ink-hi",
                  templatesOpen && "bg-white/10 text-violet-400"
                )}
              >
                <Sparkles className="size-[18px]" />
              </button>
            </Tooltip>
          </div>

          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Message SigmaGPT…"
            className="max-h-[220px] flex-1 resize-none bg-transparent py-2.5 text-[15px] text-ink-hi outline-none placeholder:text-ink-faint"
          />

          <div className="flex items-center gap-0.5 pb-1">
            <Tooltip content={listening ? "Stop dictation" : "Voice input"}>
              <button
                onClick={toggleVoice}
                className={cn(
                  "grid size-8 place-items-center rounded-lg text-ink-lo transition hover:bg-white/10 hover:text-ink-hi",
                  listening && "bg-danger/15 text-danger"
                )}
              >
                <Mic className="size-[18px]" />
              </button>
            </Tooltip>

            {isStreaming ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onStop}
                className="grid size-9 place-items-center rounded-xl bg-raised text-ink-hi transition hover:bg-hover"
                title="Stop generating"
              >
                <Square className="size-4 fill-current" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.04 }}
                onClick={submit}
                disabled={!value.trim()}
                className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-glow-sm transition disabled:bg-raised disabled:text-ink-faint disabled:shadow-none"
                title="Send"
              >
                <ArrowUp className="size-[18px]" strokeWidth={2.5} />
              </motion.button>
            )}
          </div>
        </motion.div>

        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-faint">
          <Command className="size-3" />
          SigmaGPT can make mistakes. Responses are generated locally with Ollama.
        </p>
      </div>
    </div>
  );
}
