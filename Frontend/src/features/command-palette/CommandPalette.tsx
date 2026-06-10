import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Search,
  Settings,
  PanelLeft,
  SlidersHorizontal,
  MessageSquare,
} from "lucide-react";
import { useUI } from "@/stores/ui.store";
import { useConversations } from "@/features/conversations/hooks";

export function CommandPalette() {
  const open = useUI((s) => s.commandOpen);
  const setOpen = useUI((s) => s.setCommandOpen);
  const setActiveId = useUI((s) => s.setActiveId);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const toggleContextPanel = useUI((s) => s.toggleContextPanel);
  const setSettingsOpen = useUI((s) => s.setSettingsOpen);

  const { data: conversations = [] } = useConversations();

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl"
          >
            <Command
              loop
              className="glass overflow-hidden rounded-2xl shadow-e3"
            >
              <div className="flex items-center gap-2.5 border-b border-line px-4">
                <Search className="size-4 text-ink-lo" />
                <Command.Input
                  autoFocus
                  placeholder="Search chats or run a command…"
                  className="flex-1 bg-transparent py-3.5 text-[15px] text-ink-hi outline-none placeholder:text-ink-faint"
                />
                <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[340px] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-ink-faint">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-ink-faint">
                  <Item onSelect={() => run(() => setActiveId(null))} icon={<Plus className="size-4" />}>
                    New chat
                  </Item>
                  <Item onSelect={() => run(toggleSidebar)} icon={<PanelLeft className="size-4" />}>
                    Toggle sidebar
                  </Item>
                  <Item
                    onSelect={() => run(toggleContextPanel)}
                    icon={<SlidersHorizontal className="size-4" />}
                  >
                    Toggle configuration panel
                  </Item>
                  <Item
                    onSelect={() => run(() => setSettingsOpen(true))}
                    icon={<Settings className="size-4" />}
                  >
                    Open settings
                  </Item>
                </Command.Group>

                {conversations.length > 0 && (
                  <Command.Group
                    heading="Chats"
                    className="mt-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-ink-faint"
                  >
                    {conversations.map((c) => (
                      <Item
                        key={c.id}
                        onSelect={() => run(() => setActiveId(c.id))}
                        icon={<MessageSquare className="size-4" />}
                        value={`chat-${c.title}-${c.id}`}
                      >
                        {c.title || "New chat"}
                      </Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Item({
  children,
  icon,
  onSelect,
  value,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onSelect: () => void;
  value?: string;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm text-ink outline-none transition data-[selected=true]:bg-hover data-[selected=true]:text-ink-hi"
    >
      <span className="text-ink-lo">{icon}</span>
      {children}
    </Command.Item>
  );
}
