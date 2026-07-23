import { create } from "zustand";

interface LoadingState {
  globalLoader: boolean;
  setGlobalLoader: (value: boolean) => void;
}

const useLoadingStore = create<LoadingState>((set) => ({
  globalLoader: false,
  setGlobalLoader: (value: boolean) => {
    set({ globalLoader: value });
  },
}));

export default useLoadingStore;
