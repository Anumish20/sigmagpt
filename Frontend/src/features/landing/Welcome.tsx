import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Code2, PenLine, Brain, ArrowUpRight } from "lucide-react";
import { SigmaMark } from "@/components/brand/SigmaMark";

const CATEGORIES = [
  {
    key: "Create",
    icon: PenLine,
    prompts: [
      "Draft a launch tweet for a privacy-first AI app",
      "Write a warm cold-email to a potential design hire",
      "Outline a 6-slide pitch for a local-LLM startup",
    ],
  },
  {
    key: "Code",
    icon: Code2,
    prompts: [
      "Write a debounce hook in TypeScript with cleanup",
      "Explain the difference between SSR and CSR with examples",
      "Refactor a callback pyramid into async/await",
    ],
  },
  {
    key: "Think",
    icon: Brain,
    prompts: [
      "Explain transformers like I'm a frontend dev",
      "Give me a 5-step plan to learn systems design",
      "Pros and cons of running models locally vs the cloud",
    ],
  },
] as const;

export function Welcome({ onPick }: { onPick: (text: string) => void }) {
  const [tab, setTab] = useState(0);
  const active = CATEGORIES[tab];

  return (
    <div className="grid-bg flex flex-1 flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-2xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 200, damping: 16 }}
          className="relative mb-6"
        >
          <SigmaMark size={64} animate />
          <span className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-violet-500/25 blur-2xl" />
        </motion.div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-line-hi bg-white/[0.03] px-3 py-1 text-xs text-ink-lo">
          <Sparkles className="size-3 text-violet-400" />
          Running locally · private by default
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-ink-hi sm:text-[40px]">
          Ask <span className="brand-text">SigmaGPT</span> anything
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-lo">
          A fast, private AI workspace that runs entirely on your machine. No accounts, no cloud,
          no limits.
        </p>

        {/* category tabs */}
        <div className="mt-8 flex items-center gap-1.5 rounded-full border border-line bg-surface/60 p-1">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                onClick={() => setTab(i)}
                className="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
              >
                {tab === i && (
                  <motion.span
                    layoutId="cat-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-brand shadow-glow-sm"
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  />
                )}
                <Icon className={`size-3.5 ${tab === i ? "text-white" : "text-ink-lo"}`} />
                <span className={tab === i ? "text-white" : "text-ink-lo"}>{c.key}</span>
              </button>
            );
          })}
        </div>

        {/* prompt cards */}
        <motion.div
          key={tab}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="mt-5 grid w-full gap-2.5"
        >
          {active.prompts.map((p) => (
            <motion.button
              key={p}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -2 }}
              onClick={() => onPick(p)}
              className="group flex items-center gap-3 rounded-xl border border-line bg-surface/70 px-4 py-3 text-left text-sm text-ink transition-colors hover:border-violet-500/40 hover:bg-hover hover:text-ink-hi"
            >
              <span className="flex-1">{p}</span>
              <ArrowUpRight className="size-4 text-ink-faint transition-colors group-hover:text-violet-400" />
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
