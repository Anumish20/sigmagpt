import { create } from "zustand";

interface UIState {
  activeId: string | null;
  sidebarOpen: boolean;
  contextPanelOpen: boolean;
  commandOpen: boolean;
  settingsOpen: boolean;
  model: string;
  temperature: number;

  setActiveId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
  toggleContextPanel: () => void;
  setCommandOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  setModel: (m: string) => void;
  setTemperature: (t: number) => void;
}

export const useUI = create<UIState>((set) => ({
  activeId: null,
  sidebarOpen: true,
  contextPanelOpen: false,
  commandOpen: false,
  settingsOpen: false,
  model: "phi3",
  temperature: 0.7,

  setActiveId: (id) => set({ activeId: id }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (v) => set({ sidebarOpen: v }),
  toggleContextPanel: () => set((s) => ({ contextPanelOpen: !s.contextPanelOpen })),
  setCommandOpen: (v) => set({ commandOpen: v }),
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  setModel: (m) => set({ model: m }),
  setTemperature: (t) => set({ temperature: t }),
}));
