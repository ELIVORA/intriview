/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from "zustand";

interface GlobalState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  fullScreenLoading: boolean;
  activeAnnouncement: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  setFullScreenLoading: (isLoading: boolean) => void;
  setAnnouncement: (text: string | null) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  fullScreenLoading: false,
  activeAnnouncement: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setSidebarCollapsed: (isCollapsed) => set({ sidebarCollapsed: isCollapsed }),
  setFullScreenLoading: (isLoading) => set({ fullScreenLoading: isLoading }),
  setAnnouncement: (text) => set({ activeAnnouncement: text }),
}));
