import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X, Cpu, Shield, Zap, ExternalLink } from "lucide-react";
import { useUI } from "@/stores/ui.store";
import { useModels, useHealth } from "@/features/conversations/hooks";
import { SigmaMark } from "@/components/brand/SigmaMark";

export function SettingsDialog() {
  const open = useUI((s) => s.settingsOpen);
  const setOpen = useUI((s) => s.setSettingsOpen);
  const model = useUI((s) => s.model);
  const setModel = useUI((s) => s.setModel);
  const { data } = useModels();
  const { data: health } = useHealth();
  const models = data?.models ?? [];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="glass fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-e3"
              >
                <div className="mb-5 flex items-center gap-3">
                  <SigmaMark size={36} />
                  <div className="flex-1">
                    <Dialog.Title className="text-lg font-semibold text-ink-hi">
                      Settings
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-ink-lo">
                      SigmaGPT · local workspace
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="grid size-8 place-items-center rounded-lg text-ink-lo transition hover:bg-hover hover:text-ink-hi">
                    <X className="size-4" />
                  </Dialog.Close>
                </div>

                {/* default model */}
                <section className="mb-5">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-hi">
                    <Cpu className="size-4 text-violet-400" />
                    Default model
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {models.length === 0 && (
                      <p className="col-span-2 rounded-lg border border-line bg-base/50 p-3 text-sm text-ink-lo">
                        No models detected. Run <code className="text-violet-300">ollama pull phi3</code>.
                      </p>
                    )}
                    {models.map((m) => {
                      const name = m.name.replace(/:latest$/, "");
                      const selected = name === model;
                      return (
                        <button
                          key={m.name}
                          onClick={() => setModel(name)}
                          className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition ${
                            selected
                              ? "border-violet-500/50 bg-brand-soft text-ink-hi shadow-glow-sm"
                              : "border-line bg-base/50 text-ink hover:border-line-hi"
                          }`}
                        >
                          <Cpu className="size-4 text-violet-400" />
                          <span className="flex-1 truncate">{name}</span>
                          {m.parameterSize && (
                            <span className="text-[11px] text-ink-faint">{m.parameterSize}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* status rows */}
                <section className="space-y-2">
                  <StatusRow
                    icon={<Zap className="size-4" />}
                    label="Ollama engine"
                    value={
                      health?.ollama.reachable
                        ? `Online · v${health.ollama.version}`
                        : "Offline"
                    }
                    ok={health?.ollama.reachable}
                  />
                  <StatusRow
                    icon={<Shield className="size-4" />}
                    label="Privacy"
                    value="100% local · no data leaves your machine"
                    ok
                  />
                </section>

                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-sm text-ink-lo transition hover:border-line-hi hover:text-ink-hi"
                >
                  <ExternalLink className="size-4" />
                  About SigmaGPT
                </a>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function StatusRow({
  icon,
  label,
  value,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-base/50 p-3">
      <span className="text-ink-lo">{icon}</span>
      <span className="text-sm text-ink">{label}</span>
      <span className="ml-auto flex items-center gap-1.5 text-sm text-ink-hi">
        <span className={`size-1.5 rounded-full ${ok ? "bg-success" : "bg-danger"}`} />
        {value}
      </span>
    </div>
  );
}
