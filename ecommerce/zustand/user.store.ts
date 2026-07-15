import api, { base_url } from "@/utils/apiconfig";
import Helper from "@/helper/helper";
import { create } from "zustand";

export interface IUser {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  image?: string | null;
  address?: string;
  openID?: string | null;
}

interface UserState {
  user: IUser | null;
  isLoading: boolean;
  setUser: (user: IUser | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const userStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const token = Helper.getToken();
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }

      const res = await api.get("/auth/get-profile");

      if (!res.data.success) {
        set({ user: null, isLoading: false });
        return;
      }

      set({
        user: res.data.data,
        isLoading: false,
      });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.get("/auth/logout");
    } catch {
      // ignore
    }
    Helper.clearToken();
    set({ user: null });
    window.location.replace("/");
  },
}));
