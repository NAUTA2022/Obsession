import { create } from 'zustand';

type UIState = {
  /** Visibilidad del sidebar como overlay en móvil. */
  isSidebarOpen: boolean;
  /** En desktop: sidebar colapsado a rail de solo iconos (logo siempre visible). */
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

const COLLAPSE_KEY = 'sidebarCollapsed';

const initialCollapsed =
  typeof window !== 'undefined' && localStorage.getItem(COLLAPSE_KEY) === '1';

export const useUIStore = create<UIState>((set) => ({
  // Abierto por defecto en desktop (≥768px); cerrado en móvil.
  isSidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  isSidebarCollapsed: initialCollapsed,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebarCollapsed: () =>
    set((state) => {
      const next = !state.isSidebarCollapsed;
      if (typeof window !== 'undefined') localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return { isSidebarCollapsed: next };
    }),
  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    set({ isSidebarCollapsed: collapsed });
  },
}));
