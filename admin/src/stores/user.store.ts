import { create } from "zustand";
import api, {base_url} from "../lib/axios";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  image?: string;
  address?: string;
  admin: boolean;
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

      const res = await api(`/user/get-profile`);

      if (!res.data.success === true) {
        set({ user: null, isLoading: false });
        return;
      }

      const data = await res.data;

      set({
        user: data.data,
        isLoading: false,
      });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    await fetch(`${base_url}/user/logout`, {
      method: "GET",
      credentials: "include",
    });

    set({ user: null });
    // redirect to home page
    window.location.replace("/");
  },
}));
