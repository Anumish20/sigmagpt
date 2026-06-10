import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Terminal, ExternalLink, X } from "lucide-react";
import { useHealth } from "@/features/conversations/hooks";

const REPO_URL = "https://github.com/Anumish20/sigmagpt";

/**
 * Shows a banner only when the backend can't be reached (e.g. the live Vercel
 * deploy, which has no hosted AI backend). Stays hidden whenever the API is up,
 * so it never appears during normal local use.
 */
export function DemoBanner() {
  const { isError, isLoading } = useHealth();
  const [dismissed, setDismissed] = useState(false);

  const show = !isLoading && isError && !dismissed;

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30 overflow-hidden border-b border-violet-500/20 bg-brand-soft"
        >
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand text-white shadow-glow-sm">
              <Terminal className="size-4" />
            </span>

            <p className="min-w-0 flex-1 text-[13px] leading-snug text-ink">
              <span className="font-semibold text-ink-hi">Live UI preview.</span>{" "}
              The AI runs locally with Ollama, so chat is disabled here. Clone the repo and run{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-violet-300">
                npm run dev
              </code>{" "}
              for the full streaming experience.
            </p>

            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-ink-hi transition hover:bg-white/15 sm:flex"
            >
              <ExternalLink className="size-3.5" />
              View on GitHub
            </a>

            <button
              onClick={() => setDismissed(true)}
              title="Dismiss"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-lo transition hover:bg-white/10 hover:text-ink-hi"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
