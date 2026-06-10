import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/stores/ui.store";
import { Sidebar } from "@/features/conversations/Sidebar";
import { ChatView } from "@/features/chat/ChatView";
import { ContextPanel } from "@/features/chat/ContextPanel";
import { CommandPalette } from "@/features/command-palette/CommandPalette";
import { SettingsDialog } from "@/features/settings/SettingsDialog";
import { DemoBanner } from "@/components/DemoBanner";

export function AppShell() {
  const sidebarOpen = useUI((s) => s.sidebarOpen);
  const setSidebar = useUI((s) => s.setSidebar);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const setActiveId = useUI((s) => s.setActiveId);
  const setCommandOpen = useUI((s) => s.setCommandOpen);
  const toggleContextPanel = useUI((s) => s.toggleContextPanel);

  // global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      } else if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      } else if (mod && e.key === ".") {
        e.preventDefault();
        toggleContextPanel();
      } else if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setActiveId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen, toggleSidebar, toggleContextPanel, setActiveId]);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-base">
      {/* ---- Demo banner (only shows when no backend is reachable) ---- */}
      <DemoBanner />

      <div className="flex min-h-0 w-full flex-1">
      {/* ---- Sidebar (desktop docks, mobile overlays) ---- */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <>
            {/* mobile scrim */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebar(false)}
            />
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="z-40 h-full shrink-0 max-md:fixed max-md:left-0 max-md:top-0"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---- Main column ---- */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        <ChatView />
      </main>

      {/* ---- Context panel ---- */}
      <ContextPanel />
      </div>

      {/* ---- Overlays ---- */}
      <CommandPalette />
      <SettingsDialog />
    </div>
  );
}
