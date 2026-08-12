import api from "../lib/api";
import AuthHelper from "../lib/auth";
import { create } from "zustand";
import { useCartStore } from "./cart.store";
import useOpenCloseState from "./openclose.store";
import useLoadingStore from "./loading.store";

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
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const token = await AuthHelper.getToken();
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }

      const res = await api.get("/auth/get-profile");

      if (!res.data.success) {
        set({ user: null, isLoading: false });
        return;
      }

      set({ user: res.data.data, isLoading: false });
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
    await AuthHelper.clearToken();
    set({ user: null, isLoading: false });
    useCartStore.setState({
      cart: [],
      totalCartItems: 0,
      cartTotal: 0,
      openCartSlider: false,
      isFetching: false,
      isAdding: false,
      isUpdating: false,
      isRemoving: false,
      isClearing: false,
    });
    useOpenCloseState.setState({
      variantModalOpen: false,
      variantModalProduct: null,
      openMenuSlider: false,
      openCartSlider: false,
    });
    useLoadingStore.setState({ globalLoader: false });
  },
}));
