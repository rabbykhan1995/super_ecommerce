import { create } from "zustand";

// 1️⃣ State & Actions type define
interface DashboardState {
  sidePanel: boolean;
  setSidePanel: (val: boolean) => void;
}

// 2️⃣ Create store with types
export const dashboardStore = create<DashboardState>((set) => ({
  sidePanel: false,
  setSidePanel: (val: boolean) => set({ sidePanel: val }),
}));