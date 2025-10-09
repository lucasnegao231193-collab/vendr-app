/**
 * Store Zustand para estado de UI (modais, sidebars, etc)
 */
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // PWA Install Banner
  showPWABanner: boolean;
  setShowPWABanner: (show: boolean) => void;
  deferredPrompt: any | null;
  setDeferredPrompt: (prompt: any) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  
  showPWABanner: false,
  setShowPWABanner: (show: boolean) => set({ showPWABanner: show }),
  deferredPrompt: null,
  setDeferredPrompt: (prompt: any) => set({ deferredPrompt: prompt }),
}));
