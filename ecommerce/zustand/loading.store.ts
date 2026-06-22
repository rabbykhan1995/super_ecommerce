import { create } from "zustand";

interface LoadingState {
  globalLoader: boolean;
  setGlobalLoader: (value: boolean) => void;
}

const loadingStore = create<LoadingState>((set) => ({
  globalLoader: false,
  setGlobalLoader: (value: boolean) => {
    // যখন লোডার চলবে তখন বডির কার্সার ডিজেবল করে দিবে
    if (typeof document !== "undefined") {
      document.body.style.cursor = value ? "not-allowed" : "default";
      // Optional: স্ক্রল লক করতে চাইলে
      // document.body.style.overflow = value ? "hidden" : "auto";
    }
    set({ globalLoader: value });
  },
}));

export default loadingStore;
