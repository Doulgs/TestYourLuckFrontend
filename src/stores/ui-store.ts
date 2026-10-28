import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  /** Desktop: sidebar recolhida (apenas ícones). */
  sidebarCollapsed: boolean;
  /** Mobile (< 860px): sidebar expandida sobre o conteúdo. */
  sidebarOpen: boolean;
  sound: boolean;
  toggleSidebar: (mobile: boolean) => void;
  closeSidebar: () => void;
  toggleSound: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: false,
      sound: true,
      toggleSidebar: (mobile) =>
        set((s) => (mobile ? { sidebarOpen: !s.sidebarOpen } : { sidebarCollapsed: !s.sidebarCollapsed })),
      closeSidebar: () => set({ sidebarOpen: false }),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
    }),
    { name: "tyl-ui", partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, sound: s.sound }) },
  ),
);
